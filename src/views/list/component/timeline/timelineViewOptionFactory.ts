import { RowInterface, ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import { PreviewRowComponent } from "@/views/list/component/preview/PreviewRowComponent"
import ListTimeline from "@/views/list/component/timeline/ListTimeline"
import { CalendarRange } from "lucide-react"
import { createView } from "@/utils/createView"

export interface TimelineGroupInterface {
  id: string
  label: string
  sublabel?: string
}

export interface TimelineViewOptionInterface<
  Data extends Record<string, any> = Record<string, any>,
> extends ViewInterface {
  startDateKey?: string
  endDateKey?: string
  titleKey?: string
  groupKey?: string
  /** Header of the column listing the rows — "Rooms", "Staff", "Vehicles"… */
  groupsLabel?: string
  unassignedLabel?: string
  colorByStatus?: Record<string, string>
  statusKey?: string
  resolveGroups?: (rows: RowInterface<Data>[]) => TimelineGroupInterface[]
  resolveGroupForRow?: (data: Data) => TimelineGroupInterface | undefined
  daysToShow?: number
  showUnassigned?: boolean
}

export default function timelineViewOptionFactory<
  Data extends Record<string, any> = Record<string, any>,
>(
  args?: Partial<TimelineViewOptionInterface<Data>>
): TimelineViewOptionInterface<Data> {
  const defaultArgs: Partial<TimelineViewOptionInterface<Data>> = {
    startDateKey: "startDate",
    endDateKey: "endDate",
    titleKey: "title",
    statusKey: "state",
    daysToShow: 14,
    unassignedLabel: "Unassigned",
    showUnassigned: true,
    ...args,
  }

  return createView({
    name: "timeline",
    icon: CalendarRange,
    itemComponent: DumpItemComponent,
    listComponent: ListTimeline,
    // What the window opening on a bar holds: a summary, not the record in
    // full. A resource with something better to show declares its own.
    rowComponent: PreviewRowComponent,
    ...defaultArgs,
  }) as TimelineViewOptionInterface<Data>
}
