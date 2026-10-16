/**
 * Spotlight — a layout for react-resource-view.
 *
 * A layout draws a list with three components, and nothing else:
 *
 *   list  draws the whole collection
 *   row   draws one record
 *   item  draws one field of a record
 *
 * Declare it beside the built-in ones and the reader gets a switcher; the
 * choice travels in the URL as "spotlight".
 *
 *   views: { list: { layouts: [layout.table(), spotlightLayout()] } }
 */
// Any component taking a `className` does for an icon; lucide-react is what
// the package's own layouts use — `npm i lucide-react` if you have not got it.
import { Sparkles } from "lucide-react"
import {
  ItemRender,
  layout,
  ListPagination,
  ListResourceViewButton,
  useLayout,
  type ItemComponentPropsInterface,
  type LayoutOptions,
  type ListComponentPropsInterface,
  type RowComponentPropsInterface,
} from "react-resource-view"

/**
 * The options of this layout, on top of those every layout takes (`id`,
 * `label`, `fields`…). They are read back with `useLayout().options`.
 * `dense` is an example: replace it with your own.
 */
export interface SpotlightOptions {
  dense?: boolean
}

/**
 * One field of a record.
 *
 * `ItemRender` is the package's own value renderer — booleans, relations,
 * arrays and objects included. Anything else you write here replaces it.
 */
export function SpotlightItem({ formInput }: ItemComponentPropsInterface) {
  if (!formInput) return null

  return <>{ItemRender(formInput.value)}</>
}

/**
 * One record.
 *
 * `row.data` is the record as the API answered it. The keys the API adds —
 * "@id", "@type", "id" — are dropped rather than drawn.
 */
export function SpotlightRow({ row }: RowComponentPropsInterface) {
  const data = row?.data ?? {}
  const fields = Object.entries(data).filter(
    ([key]) => !key.startsWith("@") && key !== "id"
  )

  return (
    <div className="min-w-0 space-y-1">
      {fields.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-muted-foreground">{key}</span>
          {/* A value is drawn as a paragraph, whose top margin is meant for
              prose rather than for a row of fields. */}
          <div className="min-w-0 [&_p]:mt-0">
            <SpotlightItem formInput={{ name: key, value }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The whole collection.
 *
 * `rows` is what the current page holds, already filtered and paginated.
 * `useLayout` gives this layout's own options; `useCurrentViewResourceContext`
 * the rest — the resource, the loading state, the filters.
 */
export function SpotlightList({ rows = [] }: ListComponentPropsInterface) {
  const { dense = false } = useLayout<SpotlightOptions>().options

  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Nothing to show yet
      </p>
    )
  }

  return (
    <div className="w-full">
      <ul className={dense ? "space-y-1" : "space-y-3"}>
        {rows.map((row, index) => (
          <li
            key={"row-" + index}
            className="flex items-center gap-4 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <SpotlightRow row={row} />
            </div>
            {/* Edit and delete, filtered by the resource's permissions. */}
            <div className="shrink-0">
              <ListResourceViewButton data={row.data} />
            </div>
          </li>
        ))}
      </ul>

      {/* The pager reads the collection's total; leaving it out is a choice. */}
      <div className="mt-4">
        <ListPagination />
      </div>
    </div>
  )
}

/**
 * The layout.
 *
 * Whatever is passed wins over what is written here, so a resource can still
 * adjust it on the spot:
 *
 *   spotlightLayout({ label: "Compact", dense: true })
 */
export default function spotlightLayout(
  { dense = false, components, ...options }: LayoutOptions & SpotlightOptions = {}
) {
  return layout.custom({
    type: "spotlight",
    label: "Spotlight",
    icon: Sparkles,
    ...options,
    components: {
      list: SpotlightList,
      row: SpotlightRow,
      item: SpotlightItem,
      ...components,
    },
    options: { dense },
  })
}
