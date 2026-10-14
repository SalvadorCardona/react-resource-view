import { describe, expect, it } from "vitest"
import { createViewResource } from "@/utils/createViewResource"
import {
  applyOptimisticWrites,
  createOptimisticStore,
  hasWriteInFlight,
  optimisticKey,
} from "@/api/optimistic"

/**
 * What a list draws while writes are in flight: the rows it read, with the
 * writes laid over them — and nothing that makes a row jump back and forth.
 */

const resource = createViewResource("optimistic_unit_tasks", { storage: "local" })

const task = (id: string, title: string, status = "todo") => ({
  "@id": `/tasks/${id}`,
  id,
  title,
  status,
})

const ROWS = [task("1", "Roast"), task("2", "Pack")]

const shown = (store = createOptimisticStore(), rows = ROWS) =>
  applyOptimisticWrites(rows, store.getSnapshot(), resource)

const titles = (store: ReturnType<typeof createOptimisticStore>, rows = ROWS) =>
  shown(store, rows).map((row) => row.data.title)

describe("an update", () => {
  it("is drawn at once, marked as waiting for the API", () => {
    const store = createOptimisticStore()
    store.begin("1", { kind: "update", data: { id: "1", title: "Roasted" } })

    const [first] = shown(store)
    expect(first.data.title).toBe("Roasted")
    expect(first.pending).toBe("update")
    expect(hasWriteInFlight(store.getSnapshot(), "1")).toBe(true)
  })

  it("is replaced by the API's answer, which is what counts", () => {
    const store = createOptimisticStore()
    const token = store.begin("1", { kind: "update", data: { title: "Roasted" } })
    store.succeed(token, {
      kind: "update",
      data: { ...task("1", "Roasted"), updatedAt: "2026-10-14" },
    })

    const [first] = shown(store)
    expect(first.data).toMatchObject({ title: "Roasted", updatedAt: "2026-10-14" })
    expect(first.pending).toBeUndefined()
  })

  it("goes back to what it was when the API refuses it", () => {
    const store = createOptimisticStore()
    const token = store.begin("1", { kind: "update", data: { title: "Roasted" } })
    store.fail(token)

    expect(titles(store)).toEqual(["Roast", "Pack"])
    expect(store.getSnapshot().size).toBe(0)
  })
})

describe("several writes to the same record", () => {
  it("show the last one, whatever order the answers come back in", () => {
    const store = createOptimisticStore()
    const first = store.begin("1", { kind: "update", data: { title: "A" } })
    const second = store.begin("1", { kind: "update", data: { title: "B" } })

    // The second answer comes first, then the first one, late.
    store.succeed(second, { kind: "update", data: task("1", "B") })
    expect(titles(store)[0]).toBe("B")
    store.succeed(first, { kind: "update", data: task("1", "A") })
    expect(titles(store)[0]).toBe("B")
  })

  it("never draw the older value in between", () => {
    const store = createOptimisticStore()
    const first = store.begin("1", { kind: "update", data: { title: "A" } })
    store.begin("1", { kind: "update", data: { title: "B" } })

    store.succeed(first, { kind: "update", data: task("1", "A") })
    expect(titles(store)[0]).toBe("B")
  })

  it("fall back on the last confirmed one when the latest is refused", () => {
    const store = createOptimisticStore()
    const first = store.begin("1", { kind: "update", data: { title: "A" } })
    const second = store.begin("1", { kind: "update", data: { title: "B" } })

    store.succeed(first, { kind: "update", data: task("1", "A") })
    store.fail(second)
    expect(titles(store)[0]).toBe("A")
  })

  it("keep each field of partial edits made one after the other", () => {
    const store = createOptimisticStore()
    store.begin("1", { kind: "update", data: { title: "Roasted" } })
    store.begin("1", { kind: "update", data: { status: "done" } })

    expect(shown(store)[0].data).toMatchObject({ title: "Roasted", status: "done" })
  })
})

describe("a read of the list during a write", () => {
  it("does not bring the old values back while the write is in flight", () => {
    const store = createOptimisticStore()
    const readAt = store.now()
    store.begin("1", { kind: "update", data: { title: "Roasted" } })

    // A realtime push: the list is read again, without the write in it yet.
    store.acknowledge(readAt)
    expect(titles(store, [task("1", "Roast"), task("2", "Pack")])[0]).toBe("Roasted")
  })

  it("does not drop an answer a read that left before it knows nothing of", () => {
    const store = createOptimisticStore()
    const token = store.begin("1", { kind: "update", data: { title: "Roasted" } })
    const readAt = store.now()
    store.succeed(token, { kind: "update", data: task("1", "Roasted") })

    store.acknowledge(readAt)
    expect(titles(store)[0]).toBe("Roasted")
  })

  it("lets go of the answer once a read that left after it is back", () => {
    const store = createOptimisticStore()
    const token = store.begin("1", { kind: "update", data: { title: "Roasted" } })
    store.succeed(token, { kind: "update", data: task("1", "Roasted") })

    store.acknowledge(store.now())
    expect(store.getSnapshot().size).toBe(0)
  })
})

describe("a deletion", () => {
  it("hides the row at once, and brings it back when refused", () => {
    const store = createOptimisticStore()
    const token = store.begin("2", { kind: "delete" })
    expect(titles(store)).toEqual(["Roast"])

    store.fail(token)
    expect(titles(store)).toEqual(["Roast", "Pack"])
  })

  it("keeps it hidden after the answer, until the list is read again", () => {
    const store = createOptimisticStore()
    const token = store.begin("2", { kind: "delete" })
    store.succeed(token, { kind: "delete" })

    expect(titles(store)).toEqual(["Roast"])
  })
})

describe("a creation", () => {
  it("draws a row first, with no identifier and marked as a draft", () => {
    const store = createOptimisticStore()
    store.begin(optimisticKey(resource), {
      kind: "create",
      data: { title: "Label" },
    })

    const [first] = shown(store)
    expect(first.data.title).toBe("Label")
    expect(first.pending).toBe("create")
  })

  it("takes the identifier the API gave it", () => {
    const store = createOptimisticStore()
    const token = store.begin(optimisticKey(resource), {
      kind: "create",
      data: { title: "Label" },
    })
    store.succeed(token, { kind: "create", data: task("3", "Label") })

    const [first] = shown(store)
    expect(first.data.id).toBe("3")
    expect(first.pending).toBeUndefined()
  })

  it("is not drawn twice once the list holds it", () => {
    const store = createOptimisticStore()
    const token = store.begin(optimisticKey(resource), {
      kind: "create",
      data: { title: "Label" },
    })
    store.succeed(token, { kind: "create", data: task("3", "Label") })

    expect(titles(store, [...ROWS, task("3", "Label")])).toEqual([
      "Roast",
      "Pack",
      "Label",
    ])
  })

  it("is gone when refused", () => {
    const store = createOptimisticStore()
    const token = store.begin(optimisticKey(resource), {
      kind: "create",
      data: { title: "Label" },
    })
    store.fail(token)

    expect(titles(store)).toEqual(["Roast", "Pack"])
  })
})
