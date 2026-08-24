import { ViewInterface } from "@/ViewInterface"
import { ItemTable } from "@/views/list/component/table/ItemTable"
import { ListTable } from "@/views/list/component/table/ListTable"
import { RowTable } from "@/views/list/component/table/RowTable"
import { Table } from "lucide-react"
import { createView } from "@/utils/createView"

export default function tableViewOptionFactory(
  args?: Partial<ViewInterface>
): ViewInterface {
  return createView({
    name: "table",
    icon: Table,
    itemComponent: ItemTable,
    listComponent: ListTable,
    rowComponent: RowTable,
    ...args,
  })
}
