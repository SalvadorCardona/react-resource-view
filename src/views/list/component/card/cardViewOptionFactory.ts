import { ViewInterface } from "@/ViewInterface"
import { DumpItemComponent } from "@/views/list/component/dump/DumpItemComponent"
import { ListCard } from "@/views/list/component/card/ListCard"
import { DumpRowComponent } from "@/views/list/component/dump/DumpRowComponent"
import { Rows2 } from "lucide-react"
import { createView } from "@/utils/createView"

export interface CardViewOptionInterface extends ViewInterface {
  grid?: number
}

export default function cardViewOptionFactory(
  args?: Partial<CardViewOptionInterface>
): CardViewOptionInterface {
  const defaultArgs: Partial<CardViewOptionInterface> = {
    grid: 4,
    ...args,
  }

  return createView({
    name: "card",
    icon: Rows2,
    itemComponent: DumpItemComponent,
    listComponent: ListCard,
    rowComponent: DumpRowComponent,
    ...defaultArgs,
  })
}
