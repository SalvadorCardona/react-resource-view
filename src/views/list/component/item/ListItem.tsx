import ListPagination from "@/views/list/component/ListPagination"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { Trans } from "react-mini-i18n"
import ListResourceViewButton from "@/action/ListResourceViewButton"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"
import { ScrollArea } from "@/ui/scroll-area"

export function ListItem({ rows = [] }: ListComponentPropsInterface) {
  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
        <Trans>No data yet</Trans>
      </p>
    )
  }

  return (
    <div className="w-full">
      {/* A maximum height rather than a fixed one: a handful of records stays
          compact — the pager below it never falls off a small screen — and a
          long page scrolls inside its own frame. */}
      <ScrollArea
        className="rounded-2xl border border-border"
        viewportClassName="max-h-[26rem]"
      >
        <ul className="divide-y divide-border">
          {rows.map((row, e) => (
            <li
              key={"row-" + e}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <DefaultRowComponent row={row} />
              </div>
              <div className="flex shrink-0 gap-2">
                <ListResourceViewButton data={row.data} />
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="mt-3">
        <ListPagination />
      </div>
    </div>
  )
}
