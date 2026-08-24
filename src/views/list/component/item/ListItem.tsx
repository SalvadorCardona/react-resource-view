import ListPagination from "@/views/list/component/ListPagination"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"
import { ScrollArea } from "@/ui/scroll-area"

export function ListItem({ rows = [] }: ListComponentPropsInterface) {
  return (
    <div className="w-full">
      {/* A maximum height rather than a fixed one: the list hugs its content
          d'items = composant compact, le bouton Continuer reste visible sur
          and only scrolls past 300px. */}
      <ScrollArea
        className="rounded-2xl border border-accent p-3"
        viewportClassName="max-h-[300px]"
      >
        <div className="grid grid-cols-1 gap-2">
          {rows.map((row, e) => (
            <DefaultRowComponent key={"row-" + e} row={row} />
          ))}
        </div>
      </ScrollArea>
      <ListPagination />
    </div>
  )
}
