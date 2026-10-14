import { TableCell } from "@/ui/table"
import { ItemComponentPropsInterface } from "@/ViewResource"
import { InputControllerProvider } from "react-data-form"

export function ItemTable({ formInput }: ItemComponentPropsInterface) {
  if (!formInput) return null

  return (
    <TableCell>
      <InputControllerProvider formInput={formInput} />
    </TableCell>
  )
}
