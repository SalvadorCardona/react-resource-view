import ItemRender from "@/views/list/ItemRender"
import { ItemComponentPropsInterface } from "@/ViewInterface"

export function DumpItemComponent({ formInput }: ItemComponentPropsInterface) {
  if (!formInput) return null

  return <>{ItemRender(formInput.value)}</>
}
