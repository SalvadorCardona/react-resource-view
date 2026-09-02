import type { ReactNode } from "react"
import type { RowComponentPropsInterface } from "react-resource-view"
import type { Comment, Post, Product, User } from "@/demo/playground/adminData"
import { cn } from "@/lib/cn"

/**
 * How one record is drawn in the layouts that show a whole item rather than a
 * row of cells — the card grids, and the list the comments are moderated in.
 *
 * Those layouts fall back to `DumpRowComponent`, which prints every key of the
 * raw item, `@id` and `@type` included. That is the right default for getting
 * something on screen and the wrong thing to put in a back office, so each
 * resource of the administration supplies one of these instead.
 */

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-view-soft text-view",
  warn: "bg-form-soft text-form",
  danger: "bg-destructive/10 text-destructive",
} as const

type Tone = keyof typeof TONES

function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[tone]
      )}
    >
      {children}
    </span>
  )
}

/** The same currency the form ports are configured with — see `configureLibraries`. */
const PRICE = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" })

function formatPrice(cents: number): string {
  return PRICE.format((cents ?? 0) / 100)
}

const USER_TONES: Record<User["status"], Tone> = {
  active: "info",
  invited: "warn",
  suspended: "danger",
}

const USER_LABELS: Record<User["status"], string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
}

export function UserRow({ row }: RowComponentPropsInterface) {
  const user = row?.data as User | undefined
  if (!user) return null

  const status = user.status ?? "active"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-medium leading-snug">{user.name}</p>
        <Badge tone={USER_TONES[status] ?? "neutral"}>
          {USER_LABELS[status] ?? status}
        </Badge>
      </div>

      <p className="truncate text-sm text-muted-foreground">{user.email}</p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5 capitalize">
          {user.role}
        </span>
        <span>joined {user.signedUpAt}</span>
      </p>
    </div>
  )
}

const POST_TONES: Record<Post["status"], Tone> = {
  draft: "neutral",
  scheduled: "warn",
  published: "info",
}

const POST_LABELS: Record<Post["status"], string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
}

export function PostRow({ row }: RowComponentPropsInterface) {
  const post = row?.data as Post | undefined
  if (!post) return null

  const status = post.status ?? "draft"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-medium leading-snug">{post.title}</p>
        <Badge tone={POST_TONES[status] ?? "neutral"}>
          {POST_LABELS[status] ?? status}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{post.author}</p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5">
          {post.category}
        </span>
        {post.publishedAt && <span>{post.publishedAt}</span>}
        <span aria-hidden>·</span>
        <span>{post.views} views</span>
      </p>
    </div>
  )
}

const COMMENT_TONES: Record<Comment["status"], Tone> = {
  pending: "warn",
  approved: "info",
  spam: "danger",
}

const COMMENT_LABELS: Record<Comment["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  spam: "Spam",
}

export function CommentRow({ row }: RowComponentPropsInterface) {
  const comment = row?.data as Comment | undefined
  if (!comment) return null

  const status = comment.status ?? "pending"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-medium leading-snug">{comment.author}</p>
        <Badge tone={COMMENT_TONES[status] ?? "neutral"}>
          {COMMENT_LABELS[status] ?? status}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{comment.message}</p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5">
          {comment.post}
        </span>
        <span>{comment.createdAt}</span>
      </p>
    </div>
  )
}

const PRODUCT_TONES: Record<Product["status"], Tone> = {
  draft: "neutral",
  active: "info",
  archived: "warn",
}

const PRODUCT_LABELS: Record<Product["status"], string> = {
  draft: "Draft",
  active: "On sale",
  archived: "Archived",
}

export function ProductRow({ row }: RowComponentPropsInterface) {
  const product = row?.data as Product | undefined
  if (!product) return null

  const status = product.status ?? "draft"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-medium leading-snug">{product.name}</p>
        <Badge tone={PRODUCT_TONES[status] ?? "neutral"}>
          {PRODUCT_LABELS[status] ?? status}
        </Badge>
      </div>

      <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5">
          {product.category}
        </span>
        <span className="font-medium text-foreground">
          {formatPrice(product.price)}
        </span>
        <span aria-hidden>·</span>
        <span className={cn(product.stock === 0 && "text-destructive")}>
          {product.stock === 0 ? "out of stock" : `${product.stock} in stock`}
        </span>
      </p>
    </div>
  )
}
