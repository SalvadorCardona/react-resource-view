import { setInStorage } from "ssr-safe-storage"

/**
 * The fixtures every demo on this site reads.
 *
 * Declaring a resource without a `path` makes `createViewResource` fall back to
 * the localStorage repository, so the whole documentation runs against a real
 * repository with no server behind it: creating, editing and deleting a row all
 * work, and the changes survive a reload.
 */

export interface Article {
  "@id": string
  "@type": string
  id: string
  title: string
  author: string
  category: string
  status: "draft" | "review" | "published"
  readingTime: number
  publishedAt: string
}

export interface Session {
  "@id": string
  "@type": string
  id: string
  title: string
  speaker: string
  room: string
  track: string
  status: "confirmed" | "hold"
  startAt: string
  endAt: string
}

export const ARTICLES_ID = "docs_articles"
export const SESSIONS_ID = "docs_sessions"

const ARTICLES: Article[] = [
  {
    "@id": `/${ARTICLES_ID}/1`,
    "@type": ARTICLES_ID,
    id: "1",
    title: "Describing a form as data",
    author: "Ada Lovelace",
    category: "Forms",
    status: "published",
    readingTime: 7,
    publishedAt: "2026-01-12",
  },
  {
    "@id": `/${ARTICLES_ID}/2`,
    "@type": ARTICLES_ID,
    id: "2",
    title: "One registry, or none at all",
    author: "Grace Hopper",
    category: "Architecture",
    status: "published",
    readingTime: 5,
    publishedAt: "2026-01-28",
  },
  {
    "@id": `/${ARTICLES_ID}/3`,
    "@type": ARTICLES_ID,
    id: "3",
    title: "Why a deep path 404s on static hosting",
    author: "Alan Turing",
    category: "Routing",
    status: "review",
    readingTime: 4,
    publishedAt: "2026-02-04",
  },
  {
    "@id": `/${ARTICLES_ID}/4`,
    "@type": ARTICLES_ID,
    id: "4",
    title: "Reading an IRI without thinking about it",
    author: "Ada Lovelace",
    category: "JSON-LD",
    status: "draft",
    readingTime: 9,
    publishedAt: "2026-02-19",
  },
  {
    "@id": `/${ARTICLES_ID}/5`,
    "@type": ARTICLES_ID,
    id: "5",
    title: "Seven layouts over one collection",
    author: "Barbara Liskov",
    category: "Views",
    status: "review",
    readingTime: 11,
    publishedAt: "2026-03-02",
  },
  {
    "@id": `/${ARTICLES_ID}/6`,
    "@type": ARTICLES_ID,
    id: "6",
    title: "A controller is two props and a component",
    author: "Barbara Liskov",
    category: "Forms",
    status: "draft",
    readingTime: 6,
    publishedAt: "2026-03-15",
  },
  {
    "@id": `/${ARTICLES_ID}/7`,
    "@type": ARTICLES_ID,
    id: "7",
    title: "Filters that survive the first request",
    author: "Grace Hopper",
    category: "Views",
    status: "published",
    readingTime: 8,
    publishedAt: "2026-03-27",
  },
]

/** Anchors the schedule to the Monday of the current week. */
function mondayOfThisWeek(): Date {
  const now = new Date()
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekday = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - weekday)
  return monday
}

function at(dayOffset: number, hour: number, minutes = 0): string {
  const date = mondayOfThisWeek()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minutes, 0, 0)
  return date.toISOString()
}

const SESSION_SEEDS: Array<
  Omit<Session, "@id" | "@type" | "startAt" | "endAt"> & {
    day: number
    from: number
    to: number
  }
> = [
  {
    id: "1",
    title: "Forms as data",
    speaker: "Ada Lovelace",
    room: "Amphitheatre",
    track: "React",
    status: "confirmed",
    day: 0,
    from: 9,
    to: 10,
  },
  {
    id: "2",
    title: "JSON-LD in practice",
    speaker: "Grace Hopper",
    room: "Room B",
    track: "API",
    status: "confirmed",
    day: 0,
    from: 11,
    to: 12,
  },
  {
    id: "3",
    title: "Designing a CRUD you never write twice",
    speaker: "Barbara Liskov",
    room: "Amphitheatre",
    track: "React",
    status: "confirmed",
    day: 1,
    from: 10,
    to: 12,
  },
  {
    id: "4",
    title: "Routing without a router",
    speaker: "Alan Turing",
    room: "Room B",
    track: "Architecture",
    status: "hold",
    day: 1,
    from: 14,
    to: 15,
  },
  {
    id: "5",
    title: "Validation, twice over",
    speaker: "Ada Lovelace",
    room: "Workshop",
    track: "API",
    status: "confirmed",
    day: 2,
    from: 9,
    to: 11,
  },
  {
    id: "6",
    title: "Ports, adapters and one singleton",
    speaker: "Grace Hopper",
    room: "Amphitheatre",
    track: "Architecture",
    status: "confirmed",
    day: 3,
    from: 15,
    to: 16,
  },
  {
    id: "7",
    title: "Live coding: a controller in ten lines",
    speaker: "Barbara Liskov",
    room: "Workshop",
    track: "React",
    status: "hold",
    day: 4,
    from: 13,
    to: 14,
  },
]

function buildSessions(): Session[] {
  return SESSION_SEEDS.map(({ day, from, to, ...session }) => ({
    ...session,
    "@id": `/${SESSIONS_ID}/${session.id}`,
    "@type": SESSIONS_ID,
    startAt: at(day, from),
    endAt: at(day, to),
  }))
}

function collection<T>(id: string, member: T[]) {
  return {
    "@id": id,
    "@type": "Collection",
    member,
    totalItems: member.length,
  }
}

let seeded = false

/**
 * Writes the fixtures, once per browser session.
 *
 * Only the first call of a session writes: after that the reader's own edits
 * are what the demos should show, and reseeding on every navigation would undo
 * them. Reloading the tab starts from the fixtures again.
 */
export function seedDemoData(): void {
  if (seeded) return
  seeded = true

  setInStorage(ARTICLES_ID, collection(ARTICLES_ID, ARTICLES))
  setInStorage(SESSIONS_ID, collection(SESSIONS_ID, buildSessions()))
}

export const ARTICLE_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Published", value: "published" },
]

export const ARTICLE_CATEGORIES = [
  { label: "Forms", value: "Forms" },
  { label: "Views", value: "Views" },
  { label: "Routing", value: "Routing" },
  { label: "JSON-LD", value: "JSON-LD" },
  { label: "Architecture", value: "Architecture" },
]
