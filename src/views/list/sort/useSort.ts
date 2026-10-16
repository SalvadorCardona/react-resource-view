import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import type { SortDirection, SortState } from "@/ResourceDefinition"

export interface SortInterface {
  /** The fields `views.list.sort.fields` lets the list be sorted by. */
  fields: string[]
  /** The sort the rows come in. */
  sort?: SortState
  isSortable: (field: string) => boolean
  directionOf: (field: string) => SortDirection | undefined
  /** Ascending, then descending, then not sorted by this field any more. */
  toggle: (field: string) => void
  setSort: (sort: SortState | undefined) => void
}

/** What comes after `direction` when the header of its field is clicked. */
export function nextSortDirection(
  direction: SortDirection | undefined
): SortDirection | undefined {
  if (direction === undefined) return "asc"
  if (direction === "asc") return "desc"
  return undefined
}

/**
 * The sort of the list on screen, for a column header — the table's — or a
 * layout of one's own:
 *
 * ```tsx
 * const sort = useSort()
 * <button onClick={() => sort.toggle("title")}>{sort.directionOf("title")}</button>
 * ```
 */
export function useSort(): SortInterface {
  const view = useCurrentViewResourceContext().view
  const { filterContext } = useListViewContext()
  const fields = (view.sort?.fields ?? []) as string[]
  const sort = filterContext?.sort

  const directionOf = (field: string) => sort?.[field]
  const setSort = (next: SortState | undefined) => filterContext?.setSort(next)

  return {
    fields,
    sort,
    isSortable: (field) => fields.includes(field),
    directionOf,
    toggle: (field) => {
      const direction = nextSortDirection(directionOf(field))
      setSort(direction ? { [field]: direction } : undefined)
    },
    setSort,
  }
}
