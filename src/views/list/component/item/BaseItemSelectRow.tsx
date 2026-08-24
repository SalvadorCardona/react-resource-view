import { RowComponentPropsInterface } from "@/ViewInterface"
import { BaseJsonLdItemInterface } from "jsonld-item"
import { ReactNode } from "react"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { cn } from "@/ui/cn"
import { Item } from "@/ui/item"

export default function BaseItemSelect({
  className,
  row,
  children,
  selectable = true,
}: RowComponentPropsInterface<BaseJsonLdItemInterface> & {
  children: ReactNode
  className?: string
  selectable?: boolean
}) {
  const viewResource = useCurrentViewResourceContext()

  return (
    <Item
      onClick={
        selectable
          ? () => {
              viewResource.setSelected(row?.data)
            }
          : undefined
      }
      variant={"outline"}
      className={cn(
        selectable && "cursor-pointer",
        selectable && viewResource.isSelected(row?.data)
          ? "border-primary border-2"
          : "",
        className
      )}
    >
      {children}
    </Item>
  )
}
