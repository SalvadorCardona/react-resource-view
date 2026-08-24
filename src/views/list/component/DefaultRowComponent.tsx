import { RowComponentPropsInterface } from "@/ViewInterface"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { FormInputInterface } from "react-data-form"

import { DefaultItemComponent } from "@/views/list/component/DefaultItemComponent"

export function DefaultRowComponent({ row }: RowComponentPropsInterface) {
  const data = row?.data ?? {}
  const dataKeys = Object.keys(data)
  const currentResource = useCurrentViewResourceContext()
  const CurrentRowComponent = currentResource.view.rowComponent

  if (CurrentRowComponent) {
    return <CurrentRowComponent row={row} />
  }

  return (
    <>
      {dataKeys.map((key, e) => {
        const currentValue = data[key]
        const formInput: FormInputInterface = {
          name: key,
          value: currentValue,
        }

        return <DefaultItemComponent key={"item-" + key + e} formInput={formInput} />
      })}
    </>
  )
}
