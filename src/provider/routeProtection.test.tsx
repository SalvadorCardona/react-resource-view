import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { ActionList } from "react-data-form"
import { createViewResource } from "@/utils/createViewResource"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import type { Permissions } from "@/ResourceDefinition"
import type { ScopeInterface } from "@/scope/scopeInterface"
import type { ViewResourceContextParams } from "@/ViewResourceContext"

/**
 * A refused action protects its route, not only its button: in 0.x,
 * `/books/update/1` drew the form even with `canUpdate: false` — only the
 * button leading there was hidden.
 */

interface Book {
  "@id": string
  "@type": string
  id: string
  title: string
  status: "draft" | "published"
}

const BOOKS: Book[] = [
  { "@id": "/books/1", "@type": "Book", id: "1", title: "Draft", status: "draft" },
  { "@id": "/books/2", "@type": "Book", id: "2", title: "Out", status: "published" },
]

let count = 0

function createBooks(permissions?: Permissions<Book>) {
  const id = `route_books_${++count}`
  localStorage.setItem(
    id,
    JSON.stringify({
      "@id": id,
      "@type": "Collection",
      member: BOOKS,
      totalItems: 2,
    })
  )

  return createViewResource<Book>(id, {
    name: "Books",
    storage: "local",
    form: { inputs: { title: { label: "Title" } } },
    permissions,
  })
}

function renderAt(
  params: ViewResourceContextParams,
  configuration: Parameters<typeof ResourceViewProvider>[0]["configuration"] = {}
) {
  return render(
    <ResourceViewProvider
      viewResourceContextParams={params}
      configuration={configuration}
    />
  )
}

afterEach(() => localStorage.clear())

describe("a route whose action is refused", () => {
  it("draws the form when the action is allowed", async () => {
    const resource = createBooks()
    renderAt({ resource, resourceAction: ActionList.update, id: "/books/1" })

    expect(await screen.findByRole("edit-view")).toBeInTheDocument()
  })

  it("draws the forbidden fallback instead of the form", async () => {
    const resource = createBooks({ update: false })
    renderAt({ resource, resourceAction: ActionList.update, id: "/books/1" })

    expect(await screen.findByText("Access denied")).toBeInTheDocument()
    expect(screen.queryByRole("edit-view")).toBeNull()
  })

  it("protects the list too", async () => {
    const resource = createBooks({ list: false })
    renderAt({ resource, resourceAction: ActionList.list })

    expect(await screen.findByText("Access denied")).toBeInTheDocument()
    expect(screen.queryByText("Draft")).toBeNull()
  })

  it("asks a rule about the record once it is loaded", async () => {
    const resource = createBooks({ update: ({ item }) => item?.status === "draft" })

    renderAt({ resource, resourceAction: ActionList.update, id: "/books/2" })
    expect(await screen.findByText("Access denied")).toBeInTheDocument()
  })

  it("draws the form a rule allows for that record", async () => {
    const resource = createBooks({ update: ({ item }) => item?.status === "draft" })

    renderAt({ resource, resourceAction: ActionList.update, id: "/books/1" })
    expect(await screen.findByRole("edit-view")).toBeInTheDocument()
    expect(screen.queryByText("Access denied")).toBeNull()
  })

  it("does not wait for a record that could not be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const resource = createBooks({ read: ({ item }) => Boolean(item) })

    renderAt({ resource, resourceAction: ActionList.read, id: "/books/404" })
    // The rule is asked without the record — and refuses — rather than the
    // page waiting for ever.
    expect(await screen.findByText("Access denied")).toBeInTheDocument()
    warn.mockRestore()
  })

  it("waits for an asynchronous rule", async () => {
    const resource = createBooks({ update: async () => false })

    renderAt({ resource, resourceAction: ActionList.update, id: "/books/1" })
    expect(await screen.findByText("Access denied")).toBeInTheDocument()
  })

  it("draws the configuration's fallback", async () => {
    const resource = createBooks({ delete: false })
    renderAt(
      { resource, resourceAction: ActionList.delete, id: "/books/1" },
      { forbiddenFallback: <p>Ask an editor</p> }
    )

    expect(await screen.findByText("Ask an editor")).toBeInTheDocument()
  })

  it("draws the scope's fallback first", async () => {
    const resource = createBooks({ read: false })
    const scope: ScopeInterface = {
      name: "route_scope",
      resources: [resource],
      forbiddenFallback: <p>Not in this area</p>,
    }
    // The scope loads through Suspense.
    await act(async () => {
      renderAt(
        {
          resourceId: resource["@id"],
          resourceAction: ActionList.read,
          id: "/books/1",
        },
        {
          scopes: { route_scope: async () => scope },
          defaultScope: "route_scope",
          forbiddenFallback: <p>Ask an editor</p>,
        }
      )
    })

    expect(await screen.findByText("Not in this area")).toBeInTheDocument()
  })
})
