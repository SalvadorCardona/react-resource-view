import { IconType, RowInterface } from "@/ViewInterface"
import { PopoverDescription, PopoverHeader, PopoverTitle } from "@/ui/popover"
import { ScrollArea } from "@/ui/scroll-area"
import ListResourceViewButton, {
  useRowActions,
} from "@/action/ListResourceViewButton"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { permissionResource } from "@/utils/permissionResource"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"

export interface EventPreviewProps {
  row: RowInterface
  /** What the event is called — the very text drawn on it. */
  title: string
  /** When it happens, already formatted. See `formatEventPeriod`. */
  period?: string
  /** The colour the event is drawn in, shown again as a dot before the title. */
  color?: string
  icon?: IconType
}

/**
 * The small window a calendar event or a timeline bar opens on.
 *
 * Clicking one used to print every key of the record, `@context` and
 * identifiers included: a data dump, in a popover the size of a page. What a
 * planner asks of an event is what it is, when it is, and how to open or edit
 * it — so the window names it, dates it, summarises it in a few labelled lines
 * and hands over to the row's own actions for the rest.
 *
 * The summary itself is the view's `rowComponent`, which the calendar and
 * timeline default to {@link PreviewRowComponent}: a resource wanting its own
 * preview declares it there, as it does for every other layout.
 */
export function EventPreview({
  row,
  title,
  period,
  color,
  icon: Icon,
}: EventPreviewProps) {
  const { resource } = useCurrentViewResourceContext()
  // A resource permitting none of the row's actions would otherwise be given a
  // separator with nothing under it.
  const hasActions = useRowActions().some((action) =>
    permissionResource(resource, action)
  )

  return (
    <div data-slot="event-preview" className="flex min-w-0 flex-col gap-3">
      <PopoverHeader>
        <PopoverTitle className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon className="size-4 shrink-0" />
          ) : (
            color && (
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
            )
          )}
          <span className="truncate">{title || "—"}</span>
        </PopoverTitle>
        {period && (
          <PopoverDescription className="text-xs first-letter:uppercase">
            {period}
          </PopoverDescription>
        )}
      </PopoverHeader>

      <ScrollArea viewportClassName="max-h-60">
        <DefaultRowComponent row={row} />
      </ScrollArea>

      {hasActions && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <ListResourceViewButton data={row.data} />
        </div>
      )}
    </div>
  )
}
