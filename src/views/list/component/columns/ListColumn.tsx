import { useState } from "react"
import { Trans } from "react-mini-i18n"
import { ListComponentPropsInterface } from "@/ViewInterface"
import RowWrapperColumnComponent from "@/views/list/component/columns/RowWrapperColumn"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { BoardContext, useBoard } from "@/views/list/component/columns/useBoard"
import { BoardSelectionBar } from "@/views/list/component/columns/BoardSelectionBar"

export default function ListColumn({ rows = [] }: ListComponentPropsInterface) {
  const currentViewOption = useCurrentViewResourceContext().view
  const [isDragging, setIsDragging] = useState(false)

  const identifierKey = currentViewOption.identifierKey
  const identifierKeyList = currentViewOption.identifierKeyList
  const board = useBoard({
    rows,
    identifierKey: identifierKey ?? "",
    columns: identifierKeyList ?? [],
    selectable: currentViewOption.behavior?.selectable ?? true,
  })

  if (!rows.length) return <Trans>No data yet</Trans>

  if (!identifierKey) return <>Not Identifiant Found</>
  if (!identifierKeyList) return <>no identifierKeyList</>

  return (
    <BoardContext value={board}>
      {/* The columns keep their width and the board scrolls, rather than each
          column shrinking until its cards are unreadable. */}
      <div className={"flex items-start gap-3 overflow-x-auto pb-2"}>
        {identifierKeyList.map((currentIdentifier) => (
          <RowWrapperColumnComponent
            key={currentIdentifier.value as string}
            identifierKey={identifierKey}
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
