import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import { Fragment } from "react"
import ListPagination from "@/views/list/component/ListPagination"
import { getFormInputsFromForm } from "react-data-form"
import { ListComponentPropsInterface } from "@/ViewResource"
import { Trans } from "react-mini-i18n"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { createForm } from "react-data-form"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"
import { useInlineChildView } from "@/open/childViewRoute"
import { InlineChildView } from "@/components/ChildViewResourceDialog"
import { RowInterface } from "@/ViewResource"

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
            const key =
              "row-" + getIdFromObject(row.data) + "-" + JSON.stringify(row.data)

            return (
              <Fragment key={key}>
                <DefaultRowComponent row={row} />
                <InlineRow row={row} />
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
      <ListPagination />
    </div>
  )
}

/** The view opened inline under a row: one cell across the whole table. */
function InlineRow({ row }: { row: RowInterface }) {
  const child = useInlineChildView(row.data)
  if (!child) return null

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={1000} className="p-0">
        <InlineChildView row={row} />
      </TableCell>
    </TableRow>
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
