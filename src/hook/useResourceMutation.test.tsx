import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { createViewResource } from "@/utils/createViewResource"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useResourceMutation } from "@/hook/useResourceMutation"
import { layout } from "@/layout/layout"
import type { ResourceDefinition } from "@/ResourceDefinition"

const toast = vi.hoisted(() =>
  Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() })
)
vi.mock("sonner", () => ({ toast, Toaster: () => null }))

/**
 * A list whose writes are drawn before the API answers — through the hook an
 * application uses for its own actions, which is the same path the views
 * take.
 */

interface Task {
  "@id": string
  id: string
  title: string
}

const task = (id: string, title: string): Task => ({
  "@id": `/api/tasks/${id}`,
  id,
  title,
})

/** A promise settled from the test, standing for an API taking its time. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

let server: Task[]
let pending: ReturnType<typeof deferred<any>>[]
let count = 0

/** The buttons an application would draw for its own actions. */
function Actions() {
  const tasks = useResourceMutation<Task>()
  const { fetchData } = useCurrentViewResourceContext()
  const first = server[0]

  return (
    <div>
      <button
        onClick={() =>
          void tasks.update({ ...first, title: "Roasted" }).catch(() => {})
        }
      >
        rename
      </button>
      <button
        onClick={() =>
          void tasks.update({ ...first, title: "Ground" }).catch(() => {})
        }
      >
        rename again
      </button>
      <button onClick={() => void tasks.remove(first).catch(() => {})}>
        remove
      </button>
      <button onClick={() => void tasks.create({ title: "Label" }).catch(() => {})}>
        add a draft
      </button>
      <button
        onClick={() =>
          void tasks
            .mutate({
              item: first,
              change: { title: "Archived" },
              request: () => pendingRequest(),
            })
            .catch(() => {})
        }
      >
        archive
      </button>
      <button onClick={() => fetchData()}>push</button>
      <p data-testid="pending">{String(tasks.isPending(first))}</p>
    </div>
  )
}

function pendingRequest() {
  const call = deferred<any>()
  pending.push(call)
  return call.promise
}

function renderList(definition: Partial<ResourceDefinition<Task>> = {}) {
  const id = `mutation_tasks_${++count}`
  const tasks = createViewResource<Task>(id, {
    name: "Tasks",
    repository: {
      getCollection: async () => ({
        data: {
          "@id": "/api/tasks",
          "@type": "Collection",
          member: server.map((record) => ({ ...record })),
          totalItems: server.length,
        } as never,
      }),
      getItem: async ({ id }) => ({ data: server.find((t) => t.id === id)! }),
      updateItem: () => pendingRequest(),
      createItem: () => pendingRequest(),
      removeItem: () => pendingRequest(),
    },
    form: { inputs: { title: { label: "Title" } } },
    components: { top: Actions },
    views: { list: { layouts: [layout.table()] } },
    ...definition,
  })

  render(
    <ResourceViewProvider
      viewResourceContextParams={{ scope: id, resourceId: id }}
      configuration={{ resources: [tasks], defaultScope: id }}
    />
  )
}

const rowOf = (text: string) => screen.getByText(text).closest("tr")!

beforeEach(() => {
  server = [task("1", "Roast"), task("2", "Pack")]
  pending = []
  toast.mockClear()
  toast.error.mockClear()
})

afterEach(() => vi.restoreAllMocks())

describe("an update", () => {
  it("is drawn before the API answers, and kept once it has", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("rename"))

    expect(await screen.findByText("Roasted")).toBeInTheDocument()
    expect(rowOf("Roasted")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByTestId("pending")).toHaveTextContent("true")

    server[0] = task("1", "Roasted")
    await act(async () => pending[0].resolve({ data: server[0] }))

    await waitFor(() => expect(rowOf("Roasted")).not.toHaveAttribute("aria-busy"))
    expect(screen.queryByText("Roast")).toBeNull()
  })

  it("goes back to what it was when the API refuses it, and says so", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("rename"))
    await screen.findByText("Roasted")
    await act(async () => pending[0].reject(new Error("500")))

    expect(await screen.findByText("Roast")).toBeInTheDocument()
    expect(screen.queryByText("Roasted")).toBeNull()
    expect(toast.error).toHaveBeenCalledWith("An error occurred", expect.anything())
  })

  it("lets the last of two writes win, whatever order the answers come in", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("rename"))
    fireEvent.click(screen.getByText("rename again"))
    expect(await screen.findByText("Ground")).toBeInTheDocument()

    server[0] = task("1", "Ground")
    await act(async () => pending[1].resolve({ data: task("1", "Ground") }))
    // The first answer comes back last: it does not bring its title back.
    await act(async () => pending[0].resolve({ data: task("1", "Roasted") }))

    expect(screen.getByText("Ground")).toBeInTheDocument()
    expect(screen.queryByText("Roasted")).toBeNull()
  })

  it("does not jump back when the list is read again while it is in flight", async () => {
    renderList({ realtime: true })
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("rename"))
    await screen.findByText("Roasted")

    // A realtime push: the list is read again, the write not in it yet.
    await act(async () => fireEvent.click(screen.getByText("push")))
    await act(async () => {})

    expect(screen.getByText("Roasted")).toBeInTheDocument()
    expect(screen.queryByText("Roast")).toBeNull()
  })

  it("waits for the API when the resource is not optimistic", async () => {
    renderList({ optimistic: false })
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("rename"))
    await act(async () => {})
    expect(screen.getByText("Roast")).toBeInTheDocument()
    expect(screen.queryByText("Roasted")).toBeNull()
  })
})

describe("a deletion", () => {
  it("takes the row away at once, and brings it back when refused", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("remove"))
    await waitFor(() => expect(screen.queryByText("Roast")).toBeNull())

    await act(async () => pending[0].reject(new Error("409")))
    expect(await screen.findByText("Roast")).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalled()
  })

  it("waits for the API with `views.delete.optimistic: false`", async () => {
    renderList({
      views: { list: { layouts: [layout.table()] }, delete: { optimistic: false } },
    })
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("remove"))
    await act(async () => {})
    expect(screen.getByText("Roast")).toBeInTheDocument()
  })
})

describe("a creation", () => {
  it("draws a row being saved, then the record the API created", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("add a draft"))
    expect(await screen.findByText("Label")).toBeInTheDocument()
    expect(rowOf("Label")).toHaveAttribute("aria-busy", "true")

    server.push(task("3", "Label"))
    await act(async () => pending[0].resolve({ data: task("3", "Label") }))

    await waitFor(() => expect(rowOf("Label")).not.toHaveAttribute("aria-busy"))
    expect(screen.getAllByText("Label")).toHaveLength(1)
  })
})

describe("an action of the application's own", () => {
  it("is drawn at once and rolled back the same way", async () => {
    renderList()
    await screen.findByText("Roast")

    fireEvent.click(screen.getByText("archive"))
    expect(await screen.findByText("Archived")).toBeInTheDocument()

    await act(async () => pending[0].reject(new Error("403")))
    expect(await screen.findByText("Roast")).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalled()
  })
})

describe("the delete confirmation", () => {
  it("closes and takes the row away without waiting for the API", async () => {
    renderList()
    await screen.findByText("Roast")

    const [deleteRoast] = within(rowOf("Roast")).getAllByRole("button", {
      name: /delete/i,
    })
    fireEvent.click(deleteRoast)
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.queryByText("Roast")).toBeNull()

    await act(async () => pending[0].reject(new Error("409")))
    expect(await screen.findByText("Roast")).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalledWith("The item could not be removed")
  })
})
