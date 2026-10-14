import { RowComponentPropsInterface } from "@/ViewResource"
import { DumpRowComponent } from "@/views/list/component/dump/DumpRowComponent"
import { Item, ItemContent } from "@/ui/item"

export default function RowColumn({ row }: RowComponentPropsInterface) {
  return (
    <Item>
      <ItemContent>
        <DumpRowComponent row={row} />
      </ItemContent>
    </Item>
  )
}
