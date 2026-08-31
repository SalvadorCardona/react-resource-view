import { useListViewContext } from "@/views/list/provider/useListViewContext"
import React, { useState } from "react"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { ValueOptionInterface } from "react-data-form"
import { BaseJsonLdItemInterface } from "jsonld-item"
import { Trans } from "react-mini-i18n"
import { RowInterface } from "@/ViewInterface"
import { cn } from "@/ui/cn"
import { RecordCard } from "@/views/list/component/RecordCard"

export interface RowWrapperColumnComponentPropsInterface {
  valueIdentifier: ValueOptionInterface
  isDragging: boolean
  handleDragging: (dragging: boolean) => void
  identifierKey: string
  rows: RowInterface[]
}

export default function RowWrapperColumnComponent({
  identifierKey,
  valueIdentifier,
  handleDragging,
  isDragging,
  rows,
}: RowWrapperColumnComponentPropsInterface) {
  const listViewContext = useListViewContext()
  // Highlighting every column while one card is in the air said nothing about
  // where it would land. Only the column under the pointer lights up.
  const [isOver, setIsOver] = useState(false)

  const columnRows = rows.filter(
    (row) => row.data?.[identifierKey] === valueIdentifier.value
  )

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(false)
    const id = e.dataTransfer.getData("text")
    listViewContext.updateData(
      { "@id": id, [identifierKey]: valueIdentifier.value },
      true
    )
    handleDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text", id)
    handleDragging(true)
  }

  const handleDragEnd = () => {
    setIsOver(false)
    handleDragging(false)
  }

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-muted/30 transition-colors",
        // While a card is being carried, every column reads as a target; the
        // one under the pointer reads as *the* target.
        isDragging && "border-dashed",
        isOver && "border-primary bg-primary/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="truncate text-sm font-medium">{valueIdentifier.label}</p>
        <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
          {columnRows.length}
        </span>
      </header>

      <div className="flex flex-col gap-2 px-2 pb-2">
        {columnRows.map((row) => {
          const data = row.data as BaseJsonLdItemInterface
          const id = getIdFromObject(data) as string

          return (
            <div
              key={id}
              draggable
              className="cursor-grab active:cursor-grabbing"
              onDragStart={(e) => handleDragStart(e, id)}
              onDragEnd={handleDragEnd}
            >
              {/* `row`, not `{ data: row }`: wrapping it a second time handed
                  the row component an object whose every field was undefined,
                  which is why these columns drew blank cards. */}
              <RecordCard row={row} className="bg-card" />
            </div>
          )
        })}

        {columnRows.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            <Trans>Nothing here</Trans>
          </p>
        )}
      </div>
    </div>
  )
}
