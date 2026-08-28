import type { RowComponentPropsInterface } from "react-resource-view"
import type { Article } from "@/demo/data"
import { cn } from "@/lib/cn"

const STATUS_STYLES: Record<Article["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-form-soft text-form",
  published: "bg-view-soft text-view",
}

const STATUS_LABELS: Record<Article["status"], string> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
}

/**
 * How one article is drawn in the card, list, column and split layouts.
 *
 * Those four fall back to `DumpRowComponent`, which prints every key of the raw
 * JSON-LD item — `@id` and `@type` included. That is a sensible default for
 * getting something on screen, and the wrong thing to show a reader, so the
 * demos on this site supply a `rowComponent` of their own. It is also the
 * extension point the layouts page describes, exercised rather than asserted.
 */
export function ArticleRow({ row }: RowComponentPropsInterface) {
  const article = row?.data as Article | undefined
  if (!article) return null

  const status = article.status ?? "draft"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-medium leading-snug">{article.title}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            STATUS_STYLES[status] ?? STATUS_STYLES.draft
          )}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{article.author}</p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5">
          {article.category}
        </span>
        <span>{article.readingTime} min read</span>
        <span aria-hidden>·</span>
        <span>{article.publishedAt}</span>
      </p>
    </div>
  )
}
