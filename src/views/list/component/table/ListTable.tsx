import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import ListPagination from "@/views/list/component/ListPagination"
import { getFormInputsFromForm } from "react-data-form"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { Trans } from "react-mini-i18n"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { createForm } from "react-data-form"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"

export function ListTable({ rows = [] }: ListComponentPropsInterface) {
  const currentResource = useCurrentViewResourceContext()

  if (!currentResource.view.form) {
    return <>Form is needed for build a table</>
  }

  return (
    <div className="rounded-md border flex-col gap-2">
      <ListPagination />
      <Table>
        <Header />
        <TableBody>
          {rows.map((row) => {
            return (
              <DefaultRowComponent
                key={
                  "row-" + getIdFromObject(row.data) + "-" + JSON.stringify(row.data)
                }
                row={row}
              />
            )
          })}
        </TableBody>
      </Table>
      <ListPagination />
    </div>
  )
}

export function Header() {
  const currentView = useCurrentViewResourceContext().view

  if (!currentView.form) return

  const inputs = getFormInputsFromForm(createForm(currentView.form))

  return (
    <TableHeader>
      <TableRow>
        {inputs
          .filter((input) => !input.generatedValue)
          .map((input, e) => (
            <TableHead key={"row-table-header-" + e} className={"fc"}>
              <Trans>{input.label ?? input["name"]}</Trans>
            </TableHead>
          ))}
        <TableHead />
      </TableRow>
    </TableHeader>
  )
}
