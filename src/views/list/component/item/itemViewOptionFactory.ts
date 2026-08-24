import { ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import { DumpRowComponent } from "@/views/list/component/dump/DumpRowComponent"
import { List } from "lucide-react"
import { createView } from "@/utils/createView"
import { ListItem } from "@/views/list/component/item/ListItem"

export default function itemViewOptionFactory(
  args?: Partial<ViewInterface>
): ViewInterface {
  return createView({
    name: "item",
    icon: List,
    itemComponent: DumpItemComponent,
    listComponent: ListItem,
    rowComponent: DumpRowComponent,
    ...args,
  })
}
