import { ItemComponentPropsInterface } from "@/ViewResource"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

export function DefaultItemComponent({ formInput }: ItemComponentPropsInterface) {
  const view = useCurrentViewResourceContext().view
  const Item = view.components.item
  if (!Item) {
    return <>Item Component is not defined</>
  }

  return <Item formInput={formInput} />
}
