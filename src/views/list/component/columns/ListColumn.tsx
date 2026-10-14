import { useState } from "react"
import { Trans } from "react-mini-i18n"
import { ListComponentPropsInterface } from "@/ViewResource"
import RowWrapperColumnComponent from "@/views/list/component/columns/RowWrapperColumn"
import { useLayout } from "@/layout/useLayout"
import type { BoardLayoutOptions } from "@/layout/layout"
import { BoardContext, useBoard } from "@/views/list/component/columns/useBoard"
import { BoardSelectionBar } from "@/views/list/component/columns/BoardSelectionBar"

export default function ListColumn({ rows = [] }: ListComponentPropsInterface) {
  const { groupBy, columns, selectable } = useLayout<BoardLayoutOptions>().options
  const [isDragging, setIsDragging] = useState(false)

  const board = useBoard({
    rows,
    identifierKey: groupBy ?? "",
    columns: columns ?? [],
    selectable: selectable ?? true,
  })

  if (!rows.length) return <Trans>No data yet</Trans>

  // `layout.board()` refuses to be built without them in development.
  if (!groupBy || !columns) return null

  return (
    <BoardContext value={board}>
      {/* The columns keep their width and the board scrolls, rather than each
          column shrinking until its cards are unreadable. */}
      <div className={"flex items-start gap-3 overflow-x-auto pb-2"}>
        {columns.map((currentIdentifier) => (
          <RowWrapperColumnComponent
            key={currentIdentifier.value as string}
            identifierKey={groupBy}
            valueIdentifier={currentIdentifier}
            isDragging={isDragging}
            handleDragging={setIsDragging}
            rows={rows}
          />
        ))}
      </div>
      <BoardSelectionBar board={board} />
    </BoardContext>
  )
}
