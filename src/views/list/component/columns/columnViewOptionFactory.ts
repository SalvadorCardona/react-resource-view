import { ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import RowColumn from "@/views/list/component/columns/RowColumn"
import ListColumn from "@/views/list/component/columns/ListColumn"
import { Columns3 } from "lucide-react"
import { createView } from "@/utils/createView"

export default function columnViewOptionFactory(
  args?: Partial<ViewInterface>
): ViewInterface {
  return createView({
    name: "column",
    icon: Columns3,
    listComponent: ListColumn,
    rowComponent: RowColumn,
    itemComponent: DumpItemComponent,
    ...args,
  })
}
