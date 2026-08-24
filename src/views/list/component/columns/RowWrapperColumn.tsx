import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { FormInterface } from "react-data-form"
import React from "react"
import { Card, CardContent, CardHeader } from "@/ui/card"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { ValueOptionInterface } from "react-data-form"
import { BaseJsonLdItemInterface } from "jsonld-item"
import { Badge } from "@/ui/badge"
import { RowInterface } from "@/ViewInterface"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"

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

  const getDataByIdentifier = (
    currentIdentifier: ValueOptionInterface
  ): FormInterface<BaseJsonLdItemInterface>[] => {
    return rows.filter((e) => {
      const data = e.data
      return data[identifierKey] === currentIdentifier.value
    })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text")
    listViewContext.updateData(
      { "@id": id, [identifierKey]: valueIdentifier.value },
      true
    )
    handleDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text", id)
    handleDragging(true)
  }

  const handleDragEnd = () => handleDragging(false)

  return (
    <Card
      key={valueIdentifier.value + "custom"}
      className={`w-[400px] layout-cards ${isDragging ? "bg-primary-foreground" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CardHeader>
        <Badge variant={"outline"}>{valueIdentifier.label}</Badge>
      </CardHeader>
      <CardContent>
        {getDataByIdentifier(valueIdentifier).map((item) => {
          const data = item.data as BaseJsonLdItemInterface
          const id = getIdFromObject(data) as string

          return (
            <div
              key={id}
              draggable={true}
              className={"cursor-move mt-5"}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragEnd={handleDragEnd}
            >
              <DefaultRowComponent row={{ data: item }} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
