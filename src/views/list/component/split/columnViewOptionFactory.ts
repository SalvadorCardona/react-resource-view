import { ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import RowColumn from "@/views/list/component/columns/RowColumn"
import { Columns2 } from "lucide-react"
import ListSplit from "@/views/list/component/split/ListSplit"
import { ActionList } from "react-data-form"
import { FC } from "react"
import { createView } from "@/utils/createView"

export interface SplitViewOptionInterface extends ViewInterface {
  resourceAction?: ActionList
  emptySelected?: FC
  /**
   * The split layout already shows an item's details beside the list, so the
   * resource has no separate `read` page to maintain. With this option,
   * `read/{id}` redirects to `list/{id}`, which opens the split on
   * l'item — utile pour les liens entrants (notification, e-mail, partage).
   */
  redirectReadToList?: boolean
}

export default function splitViewFactory(
  args?: SplitViewOptionInterface
): ViewInterface {
  return createView({
    name: "split",
    icon: Columns2,
    listComponent: ListSplit,
    rowComponent: RowColumn,
    itemComponent: DumpItemComponent,
    ...args,
  })
}
