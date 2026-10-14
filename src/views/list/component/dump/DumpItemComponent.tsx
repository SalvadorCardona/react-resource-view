import ItemRender from "@/views/list/ItemRender"
import { ItemComponentPropsInterface } from "@/ViewResource"

export function DumpItemComponent({ formInput }: ItemComponentPropsInterface) {
  if (!formInput) return null

  return <>{ItemRender(formInput.value)}</>
}
