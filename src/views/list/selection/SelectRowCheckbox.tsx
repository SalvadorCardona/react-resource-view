import { translate } from "react-mini-i18n"
import { Checkbox } from "@/ui/checkbox"
import { cn } from "@/ui/cn"
import { RowInterface } from "@/ViewResource"
import { useListViewContext } from "@/views/list/provider/useListViewContext"

/**
 * The checkbox selecting one record of the list — drawn only when the list is
 * selectable, and not for a record the API has not created yet.
 */
export function SelectRowCheckbox({
  row,
  className,
}: {
  row: RowInterface
  className?: string
}) {
  const { selection } = useListViewContext()
  if (!selection?.selectable || row.pending === "create") return null

  const id = selection.idOf(row)

  return (
    <Checkbox
      className={cn(className)}
      aria-label={translate("Select")}
      checked={selection.isSelected(id)}
      onCheckedChange={() => selection.toggle(id)}
      onClick={(e) => e.stopPropagation()}
    />
  )
}

/** The checkbox selecting every record of the page, or none. */
export function SelectAllCheckbox({
  rows,
  className,
}: {
  rows: RowInterface[]
  className?: string
}) {
  const { selection } = useListViewContext()
  if (!selection?.selectable) return null

  const all = selection.areAllSelected(rows)
  const some = !all && rows.some((row) => selection.isSelected(selection.idOf(row)))

  return (
    <Checkbox
      className={cn(className)}
      aria-label={translate("Select all")}
      checked={all}
      indeterminate={some}
      onCheckedChange={() => selection.toggleAll(rows)}
    />
  )
}
