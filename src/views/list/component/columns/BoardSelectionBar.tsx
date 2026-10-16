import { useState } from "react"
import { Trans } from "react-mini-i18n"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { BoardInterface } from "@/views/list/component/columns/useBoard"
import { ListSelectionBar } from "@/views/list/selection/ListSelectionBar"

/**
 * The list's selection bar, with "Move to…" — the way to move the selected
 * cards without dragging, which is also the way on a phone.
 */
export function BoardSelectionBar({ board }: { board: BoardInterface }) {
  const [isMoveOpen, setIsMoveOpen] = useState(false)

  if (!board.selected.length) return null

  const selectedRows = board.rowsOf(board.selected)

  const moveTo = (value: unknown) => {
    setIsMoveOpen(false)
    void board.moveTo(board.selected, value)
  }

  return (
    <ListSelectionBar>
      <Popover open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <PopoverTrigger render={<Button size="sm" variant="secondary" />}>
          <ArrowRightLeft />
          <Trans>Move to…</Trans>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-56 gap-1 p-2">
          {board.columns.map((column) => {
            // A column every selected card already sits in has nothing to receive.
            const isWhereAllAre = selectedRows.every(
              (row) => board.columnOf(row) === column.value
            )
            return (
              <Button
                key={String(column.value)}
                variant="ghost"
                size="sm"
                className="justify-start"
                disabled={isWhereAllAre}
                onClick={() => moveTo(column.value)}
              >
                <Trans>{column.label}</Trans>
              </Button>
            )
          })}
        </PopoverContent>
      </Popover>
    </ListSelectionBar>
  )
}
