import getIdFromObject from "@/internal/id/getIdFromObject"
import { RecordOfAny } from "@/internal/type/RecordOfAny"
import type { RowInterface, ViewResource } from "@/ViewResource"

/**
 * The writes of a resource the API has not answered yet — or has answered
 * after the list on screen was read.
 *
 * A list draws its rows from what it last read, with these laid over it: an
 * update shows its new values, a deletion hides its row, a creation adds one.
 * Kept per resource rather than per view, so the table, the board and the
 * drawer over them see the same record.
 *
 * Two rules keep the screen from flickering:
 * - writes to one record are numbered, and only the latest one shown: the
 *   answer to an older write arriving last does not bring older values back;
 * - an answer stays laid over the rows until a read of the list *started after
 *   it* comes back. A read already on its way — pushed by the realtime channel
 *   while the write was in flight — knows nothing of the write, and would put
 *   the row back where it was for the time of a request.
 */

/** What a write does to a record. */
export type OptimisticChange =
  | { kind: "update"; data: RecordOfAny }
  | { kind: "create"; data: RecordOfAny }
  | { kind: "delete" }

interface Write {
  seq: number
  change: OptimisticChange
}

interface Entry {
  /** The writes in flight, oldest first. */
  pending: Write[]
  /** The latest answer of the API, which wins over the writes sent before it. */
  confirmed?: Write
  /** When the last write settled; cleared once a later read has come back. */
  settledAt?: number
}

export interface OptimisticWriteToken {
  key: string
  seq: number
}

export interface OptimisticStore {
  subscribe: (listener: () => void) => () => void
  /** Replaced on every change, so it can be compared by identity. */
  getSnapshot: () => ReadonlyMap<string, Entry>
  begin: (key: string, change: OptimisticChange) => OptimisticWriteToken
  /** The API answered: its record replaces the guess. */
  succeed: (token: OptimisticWriteToken, change: OptimisticChange) => void
  /** The API refused: the write is dropped, and what was there before shows again. */
  fail: (token: OptimisticWriteToken) => void
  /** Where the clock is: read when a read of the list leaves. */
  now: () => number
  /** A read that left at `time` has come back: the answers older than it are in it. */
  acknowledge: (time: number) => void
}

export function createOptimisticStore(): OptimisticStore {
  let entries: ReadonlyMap<string, Entry> = new Map()
  let seq = 0
  let clock = 0
  const listeners = new Set<() => void>()

  const commit = (next: Map<string, Entry>) => {
    entries = next
    listeners.forEach((listener) => listener())
  }

  const settle = (key: string, update: (entry: Entry) => Entry) => {
    const entry = entries.get(key)
    if (!entry) return
    const next = new Map(entries)
    const updated = update(entry)
    if (updated.pending.length > 0) {
      next.set(key, updated)
    } else if (updated.confirmed) {
      next.set(key, { ...updated, settledAt: ++clock })
    } else {
      next.delete(key)
    }
    commit(next)
  }

  return {
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => entries,
    begin: (key, change) => {
      const write = { seq: ++seq, change }
      const entry = entries.get(key) ?? { pending: [] }
      const next = new Map(entries)
      next.set(key, {
        ...entry,
        pending: [...entry.pending, write],
        settledAt: undefined,
      })
      commit(next)
      return { key, seq: write.seq }
    },
    succeed: (token, change) =>
      settle(token.key, (entry) => ({
        pending: entry.pending.filter((write) => write.seq !== token.seq),
        confirmed:
          !entry.confirmed || entry.confirmed.seq < token.seq
            ? { seq: token.seq, change }
            : entry.confirmed,
      })),
    fail: (token) =>
      settle(token.key, (entry) => ({
        ...entry,
        pending: entry.pending.filter((write) => write.seq !== token.seq),
      })),
    now: () => clock,
    acknowledge: (time) => {
      const stale = [...entries].filter(
        ([, entry]) =>
          entry.pending.length === 0 &&
          entry.settledAt !== undefined &&
          entry.settledAt <= time
      )
      if (!stale.length) return
      const next = new Map(entries)
      stale.forEach(([key]) => next.delete(key))
      commit(next)
    },
  }
}

const stores = new WeakMap<object, OptimisticStore>()

/** The writes in flight of one resource, shared by every view showing it. */
export function getOptimisticStore(resource: ViewResource): OptimisticStore {
  let store = stores.get(resource)
  if (!store) {
    store = createOptimisticStore()
    stores.set(resource, store)
  }
  return store
}

/** The prefix of the key a record being created is known by until it has an id. */
const CREATED = "optimistic:"
let created = 0

/** The key a write is filed under: the record's identifier, or a new one. */
export function optimisticKey(
  resource: ViewResource,
  data?: RecordOfAny | null
): string {
  const id = data ? getIdFromObject(data, true, resource) : undefined
  return id === undefined || id === null || id === ""
    ? `${CREATED}${++created}`
    : String(id)
}

/** The writes of an entry still shown: the latest answer, and those sent after it. */
function shownWrites(entry: Entry): Write[] {
  const after = entry.pending.filter(
    (write) => !entry.confirmed || write.seq > entry.confirmed.seq
  )
  return entry.confirmed ? [entry.confirmed, ...after] : after
}

/** A record with an entry's writes applied, or `null` once it is deleted. */
function apply(base: RecordOfAny | null, entry: Entry): RecordOfAny | null {
  let record = base
  for (const { change } of shownWrites(entry)) {
    if (change.kind === "delete") record = null
    else record = { ...(record ?? {}), ...change.data }
  }
  return record
}

/** Whether an entry still waits for the API, and for which kind of write. */
function pendingKind(entry: Entry): RowInterface["pending"] {
  const latest = entry.pending.at(-1)
  if (!latest || (entry.confirmed && entry.confirmed.seq > latest.seq)) {
    return undefined
  }
  const created = entry.pending.some((write) => write.change.kind === "create")
  return created && !entry.confirmed ? "create" : "update"
}

/**
 * The rows of a list with the writes in flight laid over them: updated rows
 * show their new values, deleted ones are gone, created ones come first.
 */
export function applyOptimisticWrites(
  rows: RecordOfAny[],
  entries: ReadonlyMap<string, Entry>,
  resource: ViewResource
): RowInterface[] {
  if (entries.size === 0) return rows.map((data) => ({ data }))

  const idOf = (data: RecordOfAny) => {
    const id = getIdFromObject(data, true, resource)
    return id === undefined ? undefined : String(id)
  }

  // A record created here, once the API has given it its id: if the list
  // already holds it — read again, or pushed — it is drawn in its place
  // rather than twice.
  const creations = new Map<string, { data: RecordOfAny | null; entry: Entry }>()
  const drafts: RowInterface[] = []
  for (const [key, entry] of entries) {
    if (!key.startsWith(CREATED)) continue
    const data = apply(null, entry)
    const id = data ? idOf(data) : undefined
    if (id !== undefined && entry.confirmed) {
      creations.set(id, { data, entry })
    } else if (data) {
      drafts.push({ data, pending: pendingKind(entry) })
    }
  }

  const result: RowInterface[] = []
  for (const row of rows) {
    const id = idOf(row)
    const creation = id === undefined ? undefined : creations.get(id)
    if (creation) creations.delete(id as string)
    const entry = id === undefined ? undefined : entries.get(id)
    let data: RecordOfAny | null = creation?.data
      ? { ...row, ...creation.data }
      : row
    if (entry) data = apply(data, entry)
    if (data) result.push({ data, pending: entry && pendingKind(entry) })
  }

  // Created and answered, but not in the rows read so far.
  const created: RowInterface[] = []
  for (const [id, { data }] of creations) {
    const entry = entries.get(id)
    const shown = entry ? apply(data, entry) : data
    if (shown) created.push({ data: shown, pending: entry && pendingKind(entry) })
  }

  return [...drafts, ...created, ...result]
}

/** Whether a record has a write the API has not answered yet. */
export function hasWriteInFlight(
  entries: ReadonlyMap<string, Entry>,
  key: string
): boolean {
  const entry = entries.get(key)
  return !!entry && pendingKind(entry) !== undefined
}
