import { useState } from "react"
import { toast } from "sonner"
import { Trans, translate } from "react-mini-i18n"
import { ArrowRightLeft, X } from "lucide-react"
import { Button } from "@/ui/button"
import { cn } from "@/ui/cn"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useLayout } from "@/layout/useLayout"
import type { BoardLayoutOptions } from "@/layout/layout"
import { BoardInterface } from "@/views/list/component/columns/useBoard"

/**
 * The bar that comes up as soon as a card of the board is selected: how many
 * there are, "Move to…" — the way to move them without dragging, which is
 * also the way on a phone — the board's own `bulkActions`, and a way out.
 */
export function BoardSelectionBar({ board }: { board: BoardInterface }) {
  const currentResource = useCurrentViewResourceContext()
  const bulkActions = useLayout<BoardLayoutOptions>().options.bulkActions ?? []
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const count = board.selected.length
  if (!count) return null

  const selectedRows = board.rowsOf(board.selected)

  const moveTo = (value: unknown) => {
    setIsMoveOpen(false)
    void board.moveTo(board.selected, value)
  }

  const runAction = async (action: (typeof bulkActions)[number]) => {
    setIsRunning(true)
    try {
      await action.onAction(selectedRows.map((row) => row.data))
      board.clear()
    } catch (e) {
      console.error(e)
      toast(translate("An error occurred"))
    } finally {
      setIsRunning(false)
      currentResource.fetchData()
    }
  }

  return (
    <div
      role="toolbar"
      aria-label={translate("Selected cards")}
      className={cn(
        "fixed inset-x-0 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-2 rounded-3xl border border-border bg-popover p-2 pl-4 text-sm text-popover-foreground shadow-lg",
        // Above a phone's bottom navigation — `AdminLayout` draws one there —
        // and within reach of the thumb; near the edge on a wider screen.
        "bottom-24 md:bottom-4"
      )}
    >
      <p className="font-medium tabular-nums" aria-live="polite">
        <Trans params={{ count: String(count) }}>{"{{count}} selected"}</Trans>
      </p>

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

      {bulkActions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant="secondary"
          disabled={isRunning}
          onClick={() => runAction(action)}
        >
          {action.icon && <action.icon />}
          <Trans>{action.label}</Trans>
        </Button>
      ))}

      <Button size="sm" variant="ghost" onClick={board.clear}>
        <X />
        <Trans>Deselect all</Trans>
      </Button>
    </div>
  )
}
