import { RowInterface, ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import { DumpRowComponent } from "@/views/list/component/dump/DumpRowComponent"
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
    rowComponent: DumpRowComponent,
    ...defaultArgs,
  }) as TimelineViewOptionInterface<Data>
}
