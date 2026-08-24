import ListPagination from "@/views/list/component/ListPagination"
import { Trans } from "react-mini-i18n"
import { CardViewOptionInterface } from "@/views/list/component/card/cardViewOptionFactory"
import { cn } from "@/ui/cn"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { ListComponentPropsInterface } from "@/ViewInterface"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"

// Tailwind only generates classes written out in full in the sources. A class
// built at runtime (`"md:grid-cols-" + grid`) is never detected, and works only
// as long as some other file happens to spell out the same one.
const GRID_CLASSES: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
}

export function ListCard({ rows = [] }: ListComponentPropsInterface) {
  const view = useCurrentViewResourceContext().view as CardViewOptionInterface
  const viewContext = useListViewContext()

  if (!viewContext.data) return <Trans>No data yet</Trans>
  const grid = view?.grid ?? 4

  return (
    <div className={"w-full"}>
      <div className={cn("grid grid-cols-1 gap-5", GRID_CLASSES[grid])}>
        {rows.map((row, e) => {
          return <DefaultRowComponent key={"row-" + e} row={row} />
        })}
      </div>
      <div className={"mt-5"}>
        <ListPagination />
      </div>
    </div>
  )
}
