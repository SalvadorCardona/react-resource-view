import { ReactNode } from "react"
import { cn } from "@/ui/cn"
import { RowInterface } from "@/ViewInterface"
import ListResourceViewButton from "@/action/ListResourceViewButton"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"

export interface RecordCardProps {
  row: RowInterface
  /** Drawn under the record. Off where the frame itself is the control. */
  withActions?: boolean
  className?: string
  children?: ReactNode
}

/**
 * The frame a record is drawn in, outside a table.
 *
 * Card, item, column and split all hand the drawing of a record to the view's
 * `rowComponent` — which belongs to the consumer and knows nothing about the
 * layout around it. Giving it an edge is therefore the layout's job: without
 * one, a grid of records is a wall of text, and that is what these layouts
 * looked like. One frame for the four of them means a record reads the same
 * wherever it is shown, and gains the actions a table row has always had.
 */
export function RecordCard({
  row,
  withActions = false,
  className,
  children,
}: RecordCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4",
        "transition-colors hover:border-foreground/20",
        className
      )}
    >
      <div className="min-w-0">{children ?? <DefaultRowComponent row={row} />}</div>

      {withActions && (
        // `mt-auto` pins the actions to the bottom edge: the grid stretches
        // every card of a row to the tallest one, and without it a card whose
        // record is one line shorter puts its buttons a line higher than its
        // neighbours.
        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
          <ListResourceViewButton data={row.data} />
        </div>
      )}
    </div>
  )
}
