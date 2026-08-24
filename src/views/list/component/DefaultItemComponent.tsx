import { ItemComponentPropsInterface } from "@/ViewInterface"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

export function DefaultItemComponent({ formInput }: ItemComponentPropsInterface) {
  const view = useCurrentViewResourceContext().view
  if (!view.itemComponent) {
    return <>Item Component is not defined</>
  }

  const Item = view.itemComponent

  return <Item formInput={formInput} />
}
