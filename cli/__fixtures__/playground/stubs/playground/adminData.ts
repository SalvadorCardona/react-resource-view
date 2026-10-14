/**
 * The parts of the playground's `adminData.ts` the resources import: the
 * record types, copied as they are, and the identifiers and value lists,
 * declared — enough for the migrated declarations to be type-checked.
 */
import type { ValueOptionInterface } from "react-data-form"

export interface Company {
  "@id": string
  "@type": string
  id: string
  name: string
  city: string
  /** Fourteen digits, the way a French company is registered. */
  siret: string
  status: "prospect" | "customer" | "former"
  /** The day the account was opened. */
  signedAt: string
}

export interface User {
  "@id": string
  "@type": string
  id: string
  name: string
  email: string
  /**
   * The account the person signs in for, by name — empty for the roastery's
   * own staff. A name rather than an IRI because that is what the company page
   * filters its team on, and what its create form writes back.
   */
  company: string
  role: "admin" | "editor" | "reader"
  status: "active" | "invited" | "suspended"
  signedUpAt: string
  /**
   * The CV of this account, as the blocks it is assembled from — one account,
   * one CV. A field rather than a collection of its own: a profile nobody is
   * the profile of is not a record anybody goes looking for, and a name is a
   * poor thing to hang a document off. Built in the "Curriculum vitæ" tab of
   * the account, with the same blocks the page builder assembles.
   */
  blocks: unknown[]
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
  /**
   * What the post is made of: a hero, paragraphs, a gallery, a call to
   * action — the same blocks the page builder assembles, so a post written
   * here and a page published from the builder are one kind of record.
   */
  blocks: unknown[]
}

/**
 * A newsletter: an envelope — what the inbox shows before it is opened — and
 * the blocks of the message, assembled in the email builder and rendered by
 * `renderEmail` into the HTML a mailbox receives.
 */
export interface Newsletter {
  "@id": string
  "@type": string
  id: string
  subject: string
  preheader: string
  fromName: string
  brandColor: string
  status: "draft" | "scheduled" | "sent"
  /** The day it goes out, or went out; empty while it is a draft. */
  sendAt: string
  blocks: unknown[]
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

export interface Task {
  "@id": string
  "@type": string
  id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "in_review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  /** One of the roastery's own staff, by name — see `TASK_ASSIGNEES`. */
  assignee: string
  tags: string[]
  /** When the work is planned to start: where its bar begins on the timeline. */
  startDate: string
  dueDate: string
}

export const COMPANIES_ID = "admin_companies"
export const USERS_ID = "admin_users"
export const POSTS_ID = "admin_posts"
export const COMMENTS_ID = "admin_comments"
export const NEWSLETTERS_ID = "admin_newsletters"
export const PRODUCTS_ID = "admin_products"
export const ORDERS_ID = "admin_orders"
export const TASKS_ID = "admin_tasks"
export const OVERVIEW_ID = "admin_overview"

export declare const COMPANY_STATUSES: ValueOptionInterface[]
export declare const USER_ROLES: ValueOptionInterface[]
export declare const USER_STATUSES: ValueOptionInterface[]
export declare const POST_CATEGORIES: ValueOptionInterface[]
export declare const POST_STATUSES: ValueOptionInterface[]
export declare const NEWSLETTER_STATUSES: ValueOptionInterface[]
export declare const COMMENT_STATUSES: ValueOptionInterface[]
export declare const PRODUCT_CATEGORIES: ValueOptionInterface[]
export declare const PRODUCT_STATUSES: ValueOptionInterface[]
export declare const ORDER_STATUSES: ValueOptionInterface[]
export declare const TASK_STATUSES: ValueOptionInterface[]
export declare const TASK_PRIORITIES: ValueOptionInterface[]
export declare const TASK_ASSIGNEES: ValueOptionInterface[]
export declare const TASK_TAGS: ValueOptionInterface[]
