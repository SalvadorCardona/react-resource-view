import { RowInterface, ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import { DumpRowComponent } from "@/views/list/component/dump/DumpRowComponent"
import { ListCalendar } from "@/views/list/component/calendar/ListCalendar"
import { CalendarDays, LucideIcon } from "lucide-react"
import { createView } from "@/utils/createView"

export type CalendarViewMode = "day" | "week" | "month"

export interface CalendarViewOptionInterface extends ViewInterface {
  dateKey?: string
  endDateKey?: string
  titleKey?: string
  colorKey?: string
  mode?: CalendarViewMode
  hourStart?: number
  hourEnd?: number
  /**
   * Resolves the icon to show for a calendar item. Return `undefined` to show
   * none. Left to the resource, so this package stays generic.
   */
  getIcon?: (row: RowInterface<Record<string, unknown>>) => LucideIcon | undefined
}

export default function calendarViewOptionFactory(
  args?: Partial<CalendarViewOptionInterface>
): CalendarViewOptionInterface {
  const defaultArgs: Partial<CalendarViewOptionInterface> = {
    dateKey: "dueDate",
    mode: "month",
    hourStart: 7,
    hourEnd: 21,
    ...args,
  }

  return createView({
    name: "calendar",
    icon: CalendarDays,
    itemComponent: DumpItemComponent,
    listComponent: ListCalendar,
    rowComponent: DumpRowComponent,
    ...defaultArgs,
  })
}
