import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createViewResource } from "@/utils/createViewResource"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { configureApi, resetApiConfig } from "@/api/apiConfig"
import { strapiDialect } from "@/api/dialect/strapiDialect"
import { supabaseDialect } from "@/api/dialect/supabaseDialect"
import { ApiDialectInterface } from "@/api/apiDialectInterface"
import columnViewOptionFactory from "@/views/list/component/columns/columnViewOptionFactory"
import { RowComponentPropsInterface } from "@/ViewInterface"

const toast = vi.hoisted(() => vi.fn())
vi.mock("sonner", () => ({ toast, Toaster: () => null }))

/**
 * The JSON-LD repository goes through the client of `jsonld-api-client`, which
 * takes hold of `fetch` when it is loaded: the stand-in has to be there first.
 */
const network = vi.hoisted(() => {
  const state = {
    calls: [] as { method: string; url: string; body: string }[],
    respond: (() => ({})) as (method: string) => unknown,
  }
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    state.calls.push({
      method: request.method,
      url: request.url,
      body: await request.text(),
    })
    return new Response(JSON.stringify(state.respond(request.method)), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }) as typeof fetch
  return state
})

/**
 * Moving a card to another column writes the new status back, whatever keeps
 * the records: the local repository, where they carry an IRI, or a REST
 * backend, which each address a record by an identifier of their own.
 */

const STATUSES = [
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
]

function TaskRow({ row }: RowComponentPropsInterface) {
  return <span>{row?.data?.title}</span>
}

const view = {
  name: "Tasks",
  viewVariants: [
    columnViewOptionFactory({
      rowComponent: TaskRow,
      identifierKey: "status",
      identifierKeyList: STATUSES,
    }),
  ],
}

function renderBoard(scope: string, resourceId: string, resource: unknown) {
  return render(
    <ResourceViewProvider
      viewResourceContextParams={{ scope, resourceId }}
      configuration={{ resources: [resource as any], defaultScope: scope }}
    />
  )
}

/** jsdom has no DataTransfer; the one drag both events share is enough. */
async function dragCard(title: string, columnLabel: string) {
  const store: Record<string, string> = {}
  const dataTransfer = {
    setData: (format: string, value: string) => (store[format] = value),
    getData: (format: string) => store[format] ?? "",
  }

  const card = (await screen.findByText(title)).closest("[draggable]")!
  const column = screen.getByText(columnLabel).closest("header")!.parentElement!

  fireEvent.dragStart(card, { dataTransfer })
  fireEvent.dragOver(column, { dataTransfer })
  fireEvent.drop(column, { dataTransfer })
}

beforeEach(() => {
  toast.mockClear()
  network.calls.length = 0
})

afterEach(() => {
  resetApiConfig()
  localStorage.clear()
})

describe("a board kept in the local repository", () => {
  const readTasks = (id: string) =>
    JSON.parse(localStorage.getItem(id) ?? "{}").member as Array<{
      "@id": string
      status: string
    }>

  const seed = (id: string) =>
    localStorage.setItem(
      id,
      JSON.stringify({
        "@id": id,
        "@type": "Collection",
        member: [
          {
            "@id": `/${id}/12`,
            "@type": id,
            id: "12",
            title: "Roast",
            status: "todo",
          },
          {
            "@id": `/${id}/13`,
            "@type": id,
            id: "13",
            title: "Pack",
            status: "done",
          },
        ],
        totalItems: 2,
      })
    )

  it("stores the new status of a card whose record has an IRI", async () => {
    seed("local_board_tasks")
    const tasks = createViewResource("local_board_tasks", {
      name: "Tasks",
      scope: "local_board",
      view,
    })
    renderBoard("local_board", "local_board_tasks", tasks)

    await dragCard("Roast", "Done")

    await waitFor(() => {
      expect(readTasks("local_board_tasks")[0].status).toBe("done")
    })
    expect(readTasks("local_board_tasks")[0]["@id"]).toBe("/local_board_tasks/12")
    expect(toast).toHaveBeenCalledWith("Saved")
    expect(toast).not.toHaveBeenCalledWith("An error occurred")
  })

  it("sends nothing when the card is dropped back into its own column", async () => {
    seed("local_same_tasks")
    const tasks = createViewResource("local_same_tasks", {
      name: "Tasks",
      scope: "local_same",
      view,
    })
    renderBoard("local_same", "local_same_tasks", tasks)
    const before = localStorage.getItem("local_same_tasks")

    await dragCard("Roast", "To do")

    // Whatever would be written, and whatever it would say, happens after a
    // promise: give it the chance to.
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(localStorage.getItem("local_same_tasks")).toBe(before)
    expect(toast).not.toHaveBeenCalled()
  })
})

describe("a board kept behind a REST backend", () => {
  async function moveOn(
    name: string,
    path: string,
    collection: unknown,
    dialect?: ApiDialectInterface
  ) {
    network.respond = (method) => (method === "GET" ? collection : {})
    configureApi({ baseUrl: "https://api.example.com", fetch: globalThis.fetch })
    const tasks = createViewResource(`${name}_tasks`, {
      path,
      name: "Tasks",
      scope: name,
      dialect,
      view,
    })
    renderBoard(name, `${name}_tasks`, tasks)

    await dragCard("Roast", "Done")
    await waitFor(() => expect(toast).toHaveBeenCalledWith("Saved"))

    const write = network.calls.find(({ method }) => method !== "GET")!
    return { method: write.method, url: write.url, body: JSON.parse(write.body) }
  }

  it("addresses a JSON-LD record by the number behind its IRI", async () => {
    const { method, url, body } = await moveOn("jsonld_board", "/api/tasks", {
      member: [{ "@id": "/api/tasks/12", id: 12, title: "Roast", status: "todo" }],
      totalItems: 1,
    })

    expect(method).toBe("PATCH")
    expect(url).toMatch(/\/api\/tasks\/12$/)
    expect(body.status).toBe("done")
    expect(body.title).toBeUndefined()
  })

  it("addresses a Strapi record by its documentId", async () => {
    const { method, url, body } = await moveOn(
      "strapi_board",
      "tasks",
      {
        data: [{ id: 1, documentId: "kx8f2", title: "Roast", status: "todo" }],
        meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } },
      },
      strapiDialect()
    )

    expect(method).toBe("PUT")
    expect(url).toBe("https://api.example.com/api/tasks/kx8f2")
    expect(body).toEqual({ data: { status: "done" } })
  })

  it("addresses a Supabase row by its primary key", async () => {
    const { method, url, body } = await moveOn(
      "supabase_board",
      "tasks",
      [{ id: 7, title: "Roast", status: "todo" }],
      supabaseDialect({ apiKey: "anon-key" })
    )

    expect(method).toBe("PATCH")
    expect(url).toContain("/rest/v1/tasks?")
    expect(url).toContain("id=eq.7")
    expect(body).toEqual({ status: "done" })
  })
})
