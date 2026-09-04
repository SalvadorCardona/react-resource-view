import { getInStorage, setInStorage } from "ssr-safe-storage"

/**
 * The fixtures the playground's back office runs on.
 *
 * A small coffee roastery: the people who can sign in, the blog it publishes,
 * the catalogue it sells and the roasters it runs. Four areas rather than one
 * collection, because that is what a scope is for — an administration is a
 * menu of resources, and a single list would never show it.
 *
 * None of these resources declares a `path`, so `createViewResource` falls back
 * to the localStorage repository: the whole back office is genuinely writable,
 * and the changes survive a reload — see `seedAdminData`.
 */

export interface User {
  "@id": string
  "@type": string
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "reader"
  status: "active" | "invited" | "suspended"
  signedUpAt: string
}

export interface Post {
  "@id": string
  "@type": string
  id: string
  title: string
  author: string
  category: string
  status: "draft" | "scheduled" | "published"
  publishedAt: string
  views: number
}

export interface Comment {
  "@id": string
  "@type": string
  id: string
  post: string
  author: string
  message: string
  status: "pending" | "approved" | "spam"
  createdAt: string
}

export interface Product {
  "@id": string
  "@type": string
  id: string
  name: string
  sku: string
  category: string
  /** In cents, which is what `PriceInputController` reads and writes. */
  price: number
  stock: number
  status: "draft" | "active" | "archived"
}

export interface Order {
  "@id": string
  "@type": string
  id: string
  reference: string
  customer: string
  /** In cents, like a product's price. */
  total: number
  status: "pending" | "paid" | "shipped" | "refunded"
  placedAt: string
}

export interface Roast {
  "@id": string
  "@type": string
  id: string
  /** The name of the batch, which is what the calendar and the timeline show. */
  batch: string
  origin: string
  /** The machine it goes on — the lane of the timeline. */
  roaster: string
  profile: "light" | "medium" | "dark"
  /** Green coffee going in, in kilograms. */
  weight: number
  status: "planned" | "roasting" | "done" | "rejected"
  startAt: string
  endAt: string
}

export const USERS_ID = "admin_users"
export const POSTS_ID = "admin_posts"
export const COMMENTS_ID = "admin_comments"
export const PRODUCTS_ID = "admin_products"
export const ORDERS_ID = "admin_orders"
export const ROASTS_ID = "admin_roasts"

/**
 * The overview is a resource like the others — it is what the scope opens on —
 * but it holds no rows: its screen is drawn from the collections above.
 */
export const OVERVIEW_ID = "admin_overview"

export const USER_ROLES = [
  { label: "Administrator", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Reader", value: "reader" },
]

export const USER_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
]

export const POST_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
]

export const POST_CATEGORIES = [
  { label: "Brewing", value: "Brewing" },
  { label: "Guides", value: "Guides" },
  { label: "Sourcing", value: "Sourcing" },
  { label: "Roastery", value: "Roastery" },
]

export const COMMENT_STATUSES = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Spam", value: "spam" },
]

export const PRODUCT_CATEGORIES = [
  { label: "Coffee", value: "Coffee" },
  { label: "Equipment", value: "Equipment" },
  { label: "Subscription", value: "Subscription" },
]

export const PRODUCT_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "On sale", value: "active" },
  { label: "Archived", value: "archived" },
]

export const ORDER_STATUSES = [
  { label: "Awaiting payment", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Refunded", value: "refunded" },
]

/**
 * The value is the label: the timeline names its lanes after the raw value of
 * `groupKey`, and a machine is easier to find under its name than under a code.
 */
export const ROASTERS = [
  { label: "Probat P12", value: "Probat P12" },
  { label: "Loring S35", value: "Loring S35" },
  { label: "Sample roaster", value: "Sample roaster" },
]

export const ROAST_PROFILES = [
  { label: "Light", value: "light" },
  { label: "Medium", value: "medium" },
  { label: "Dark", value: "dark" },
]

export const ROAST_STATUSES = [
  { label: "Planned", value: "planned" },
  { label: "Roasting", value: "roasting" },
  { label: "Done", value: "done" },
  { label: "Failed cupping", value: "rejected" },
]

const USERS: Array<Omit<User, "@id" | "@type">> = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@roastery.example",
    role: "admin",
    status: "active",
    signedUpAt: "2025-11-03",
  },
  {
    id: "2",
    name: "Grace Hopper",
    email: "grace@roastery.example",
    role: "editor",
    status: "active",
    signedUpAt: "2025-12-14",
  },
  {
    id: "3",
    name: "Alan Turing",
    email: "alan@roastery.example",
    role: "editor",
    status: "invited",
    signedUpAt: "2026-01-07",
  },
  {
    id: "4",
    name: "Barbara Liskov",
    email: "barbara@roastery.example",
    role: "admin",
    status: "active",
    signedUpAt: "2026-01-22",
  },
  {
    id: "5",
    name: "Katherine Johnson",
    email: "katherine@roastery.example",
    role: "reader",
    status: "active",
    signedUpAt: "2026-02-02",
  },
  {
    id: "6",
    name: "Margaret Hamilton",
    email: "margaret@roastery.example",
    role: "editor",
    status: "suspended",
    signedUpAt: "2026-02-18",
  },
  {
    id: "7",
    name: "Radia Perlman",
    email: "radia@roastery.example",
    role: "reader",
    status: "invited",
    signedUpAt: "2026-03-05",
  },
]

const POSTS: Array<Omit<Post, "@id" | "@type">> = [
  {
    id: "1",
    title: "Choosing a grinder you will keep",
    author: "Ada Lovelace",
    category: "Guides",
    status: "published",
    publishedAt: "2026-01-09",
    views: 1284,
  },
  {
    id: "2",
    title: "Water, the ingredient nobody weighs",
    author: "Grace Hopper",
    category: "Brewing",
    status: "published",
    publishedAt: "2026-01-24",
    views: 962,
  },
  {
    id: "3",
    title: "Our Ethiopian harvest, from farm to bag",
    author: "Barbara Liskov",
    category: "Sourcing",
    status: "published",
    publishedAt: "2026-02-06",
    views: 2481,
  },
  {
    id: "4",
    title: "Why we roast on Tuesdays",
    author: "Katherine Johnson",
    category: "Roastery",
    status: "published",
    publishedAt: "2026-02-27",
    views: 741,
  },
  {
    id: "5",
    title: "The inverted Aeropress, step by step",
    author: "Alan Turing",
    category: "Brewing",
    status: "scheduled",
    publishedAt: "2026-03-12",
    views: 0,
  },
  {
    id: "6",
    title: "Decaf, without the apologies",
    author: "Margaret Hamilton",
    category: "Guides",
    status: "draft",
    publishedAt: "",
    views: 0,
  },
  {
    id: "7",
    title: "Cupping notes: the March lots",
    author: "Radia Perlman",
    category: "Sourcing",
    status: "draft",
    publishedAt: "",
    views: 0,
  },
]

const COMMENTS: Array<Omit<Comment, "@id" | "@type">> = [
  {
    id: "1",
    post: "Choosing a grinder you will keep",
    author: "Jules",
    message: "Bought the hand grinder after reading this. No regrets.",
    status: "approved",
    createdAt: "2026-01-11",
  },
  {
    id: "2",
    post: "Water, the ingredient nobody weighs",
    author: "Norah",
    message: "Which mineral profile do you use for filter?",
    status: "pending",
    createdAt: "2026-01-25",
  },
  {
    id: "3",
    post: "Water, the ingredient nobody weighs",
    author: "anon",
    message: "Cheap watches, best price, click here.",
    status: "spam",
    createdAt: "2026-01-26",
  },
  {
    id: "4",
    post: "Our Ethiopian harvest, from farm to bag",
    author: "Selam",
    message: "Lovely to see the farm named for once. Thank you.",
    status: "approved",
    createdAt: "2026-02-08",
  },
  {
    id: "5",
    post: "Why we roast on Tuesdays",
    author: "Tomas",
    message: "Does the Friday batch ship the same week?",
    status: "pending",
    createdAt: "2026-03-01",
  },
  {
    id: "6",
    post: "Choosing a grinder you will keep",
    author: "Wei",
    message: "A burr size comparison would help a lot.",
    status: "approved",
    createdAt: "2026-03-04",
  },
]

const PRODUCTS: Array<Omit<Product, "@id" | "@type">> = [
  {
    id: "1",
    name: "Ethiopia Yirgacheffe — 250 g",
    sku: "COF-ETH-250",
    category: "Coffee",
    price: 1450,
    stock: 128,
    status: "active",
  },
  {
    id: "2",
    name: "Colombia Huila — 1 kg",
    sku: "COF-COL-1K",
    category: "Coffee",
    price: 4800,
    stock: 42,
    status: "active",
  },
  {
    id: "3",
    name: "Brazil Cerrado — 250 g",
    sku: "COF-BRA-250",
    category: "Coffee",
    price: 1190,
    stock: 0,
    status: "active",
  },
  {
    id: "4",
    name: "Hand grinder, steel burrs",
    sku: "EQP-GRD-01",
    category: "Equipment",
    price: 8900,
    stock: 17,
    status: "active",
  },
  {
    id: "5",
    name: "Pour-over kettle, 1 L",
    sku: "EQP-KTL-02",
    category: "Equipment",
    price: 6500,
    stock: 9,
    status: "active",
  },
  {
    id: "6",
    name: "Paper filters, box of 100",
    sku: "EQP-FLT-03",
    category: "Equipment",
    price: 700,
    stock: 240,
    status: "active",
  },
  {
    id: "7",
    name: "Monthly subscription, 2 bags",
    sku: "SUB-MTH-02",
    category: "Subscription",
    price: 2400,
    stock: 999,
    status: "active",
  },
  {
    id: "8",
    name: "Cold brew bottle, 700 ml",
    sku: "EQP-BTL-04",
    category: "Equipment",
    price: 2200,
    stock: 0,
    status: "draft",
  },
]

const ORDERS: Array<Omit<Order, "@id" | "@type">> = [
  {
    id: "1",
    reference: "CMD-2601",
    customer: "Jules Ferrand",
    total: 6250,
    status: "shipped",
    placedAt: "2026-02-19",
  },
  {
    id: "2",
    reference: "CMD-2602",
    customer: "Norah Bekele",
    total: 14300,
    status: "paid",
    placedAt: "2026-02-24",
  },
  {
    id: "3",
    reference: "CMD-2603",
    customer: "Tomas Novak",
    total: 2400,
    status: "paid",
    placedAt: "2026-03-01",
  },
  {
    id: "4",
    reference: "CMD-2604",
    customer: "Wei Zhang",
    total: 9800,
    status: "pending",
    placedAt: "2026-03-03",
  },
  {
    id: "5",
    reference: "CMD-2605",
    customer: "Selam Abebe",
    total: 4800,
    status: "refunded",
    placedAt: "2026-03-05",
  },
  {
    id: "6",
    reference: "CMD-2606",
    customer: "Iris Lambert",
    total: 3100,
    status: "shipped",
    placedAt: "2026-03-07",
  },
]

/** Anchors the roasting schedule to the Monday of the current week. */
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

/**
 * A week on the roasters. The dates are computed at seed time rather than
 * written down, so the calendar opens on a full week whatever day it is read.
 */
const ROAST_SEEDS: Array<
  Omit<Roast, "@id" | "@type" | "startAt" | "endAt"> & {
    day: number
    from: number
    to: number
  }
> = [
  {
    id: "1",
    batch: "Ethiopia Yirgacheffe, lot 12",
    origin: "Ethiopia",
    roaster: "Probat P12",
    profile: "light",
    weight: 12,
    status: "done",
    day: 0,
    from: 7,
    to: 9,
  },
  {
    id: "2",
    batch: "Colombia Huila, lot 4",
    origin: "Colombia",
    roaster: "Loring S35",
    profile: "medium",
    weight: 35,
    status: "done",
    day: 0,
    from: 9,
    to: 12,
  },
  {
    id: "3",
    batch: "Brazil Cerrado, espresso",
    origin: "Brazil",
    roaster: "Loring S35",
    profile: "dark",
    weight: 30,
    status: "rejected",
    day: 1,
    from: 8,
    to: 11,
  },
  {
    id: "4",
    batch: "Kenya AA, sample",
    origin: "Kenya",
    roaster: "Sample roaster",
    profile: "light",
    weight: 1,
    status: "done",
    day: 1,
    from: 14,
    to: 15,
  },
  {
    id: "5",
    batch: "Ethiopia Yirgacheffe, lot 13",
    origin: "Ethiopia",
    roaster: "Probat P12",
    profile: "light",
    weight: 12,
    status: "roasting",
    day: 2,
    from: 7,
    to: 10,
  },
  {
    id: "6",
    batch: "Decaf Colombia, Swiss water",
    origin: "Colombia",
    roaster: "Probat P12",
    profile: "medium",
    weight: 10,
    status: "planned",
    day: 2,
    from: 13,
    to: 15,
  },
  {
    id: "7",
    batch: "Guatemala Antigua, lot 2",
    origin: "Guatemala",
    roaster: "Loring S35",
    profile: "medium",
    weight: 35,
    status: "planned",
    day: 3,
    from: 8,
    to: 12,
  },
  {
    id: "8",
    batch: "Rwanda Nyamasheke, sample",
    origin: "Rwanda",
    roaster: "Sample roaster",
    profile: "light",
    weight: 1,
    status: "planned",
    day: 3,
    from: 15,
    to: 16,
  },
  {
    id: "9",
    batch: "Subscription blend, March",
    origin: "Brazil, Colombia",
    roaster: "Loring S35",
    profile: "medium",
    weight: 35,
    status: "planned",
    day: 4,
    from: 7,
    to: 11,
  },
  {
    id: "10",
    batch: "Cold brew blend",
    origin: "Brazil",
    roaster: "Probat P12",
    profile: "dark",
    weight: 12,
    status: "planned",
    day: 4,
    from: 11,
    to: 14,
  },
]

function buildRoasts(): Array<Omit<Roast, "@id" | "@type">> {
  return ROAST_SEEDS.map(({ day, from, to, ...roast }) => ({
    ...roast,
    startAt: at(day, from),
    endAt: at(day, to),
  }))
}

/** Gives a fixture its IRI and its type, which is what a row is addressed by. */
function identify<T extends { id: string }>(type: string, rows: T[]) {
  return rows.map((row) => ({
    ...row,
    "@id": `/${type}/${row.id}`,
    "@type": type,
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

function write(id: string, rows: Array<{ id: string }>): void {
  setInStorage(id, collection(id, identify(id, rows)))
}

/** Every collection of the back office, with the fixtures it starts from. */
function fixtures(): Array<[string, Array<{ id: string }>]> {
  return [
    [USERS_ID, USERS],
    [POSTS_ID, POSTS],
    [COMMENTS_ID, COMMENTS],
    [PRODUCTS_ID, PRODUCTS],
    [ORDERS_ID, ORDERS],
    [ROASTS_ID, buildRoasts()],
  ]
}

/**
 * Writes the back office fixtures — only where nothing is stored yet.
 *
 * Unlike the documentation demos, which start over on every load, the
 * administration keeps what the reader did to it: a product renamed on Monday
 * is still renamed on Tuesday, which is what makes it read as an application
 * rather than a demo. `resetAdminData` is the way back to the fixtures.
 */
export function seedAdminData(): void {
  for (const [id, rows] of fixtures()) {
    if (getInStorage(id) == null) write(id, rows)
  }
}

/** Throws away every edit and writes the fixtures again. */
export function resetAdminData(): void {
  for (const [id, rows] of fixtures()) write(id, rows)
}

/**
 * Reads one collection as the rows it holds, for a screen that is not a list
 * of that resource — the overview counts them and links to them.
 */
export function readAdminRows<T>(id: string): T[] {
  const stored = getInStorage<{ member?: T[] }>(id)
  return stored?.member ?? []
}
