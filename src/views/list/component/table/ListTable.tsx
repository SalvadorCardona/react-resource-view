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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/ui/cn"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { useSort } from "@/views/list/sort/useSort"
import { SelectAllCheckbox } from "@/views/list/selection/SelectRowCheckbox"

export function ListTable({ rows = [] }: ListComponentPropsInterface) {
  const currentResource = useCurrentViewResourceContext()

  if (!currentResource.view.form) {
    return <>Form is needed for build a table</>
  }

  return (
    <div className="rounded-md border flex-col gap-2">
      <ListPagination />
      <Table>
        <Header rows={rows} />
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

export function Header({ rows = [] }: { rows?: RowInterface[] }) {
  const currentView = useCurrentViewResourceContext().view
  const { selection } = useListViewContext()
  const sort = useSort()

  if (!currentView.form) return

  const inputs = getFormInputsFromForm(createForm(currentView.form))

  return (
    <TableHeader>
      <TableRow>
        {selection?.selectable && (
          <TableHead className="w-10">
            <SelectAllCheckbox rows={rows} />
          </TableHead>
        )}
        {inputs
          .filter((input) => !input.generatedValue)
          .map((input, e) => {
            const field = String(input["name"] ?? input.id)
            const label = <Trans>{input.label ?? input["name"]}</Trans>
            if (!sort.isSortable(field)) {
              return (
                <TableHead key={"row-table-header-" + e} className={"fc"}>
                  {label}
                </TableHead>
              )
            }

            const direction = sort.directionOf(field)
            const Icon =
              direction === "asc"
                ? ArrowUp
                : direction === "desc"
                  ? ArrowDown
                  : ArrowUpDown

            return (
              <TableHead
                key={"row-table-header-" + e}
                className={"fc"}
                aria-sort={
                  direction === "asc"
                    ? "ascending"
                    : direction === "desc"
                      ? "descending"
                      : "none"
                }
              >
                <button
                  type="button"
                  className="-ml-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground focus-visible:outline-2"
                  onClick={() => sort.toggle(field)}
                >
                  {label}
                  <Icon
                    aria-hidden
                    className={cn("size-3.5", !direction && "opacity-40")}
                  />
                </button>
              </TableHead>
            )
          })}
        <TableHead />
      </TableRow>
    </TableHeader>
  )
}
