import type { RowComponentPropsInterface } from "react-resource-view"
import type { BuilderBlock } from "@/demo/builder/blocks"

/**
 * A CV, as a row of the "Curriculum vitæ" tab of an account.
 *
 * A record made of blocks has nothing worth putting in a column: the count and
 * the last edit are what a reader wants to know without opening it, and the
 * blocks themselves only read as anything in the editor.
 */
interface Document {
  title: string
  blocks: BuilderBlock[]
  updatedAt: string
}

export function DocumentRow({ row }: RowComponentPropsInterface) {
  const doc = row?.data as Document | undefined
  if (!doc) return null

  const blockCount = doc.blocks?.length ?? 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <p className="min-w-0 font-medium leading-snug">
        {doc.title || "Untitled"}
      </p>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded border border-border px-1.5 py-0.5">
          {blockCount} block{blockCount === 1 ? "" : "s"}
        </span>
        {doc.updatedAt && (
          <span>edited {new Date(doc.updatedAt).toLocaleDateString()}</span>
        )}
      </p>
    </div>
  )
}
