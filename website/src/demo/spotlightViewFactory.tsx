/**
 * Spotlight — a view variant for react-resource-view.
 *
 * A variant is a view with three rendering slots, and nothing else:
 *
 *   listComponent  draws the whole collection
 *   rowComponent   draws one record
 *   itemComponent  draws one field of a record
 *
 * Declare it beside the built-in ones and the reader gets a switcher; the
 * choice travels in the URL as "spotlight".
 *
 *   viewVariants: [tableViewOptionFactory(), spotlightViewFactory()]
 */
// Any component taking a `className` does for an icon; lucide-react is what
// the package's own layouts use — `npm i lucide-react` if you have not got it.
import { Sparkles } from "lucide-react"
import {
  createView,
  ItemRender,
  ListPagination,
  ListResourceViewButton,
  useCurrentViewResourceContext,
  type ItemComponentPropsInterface,
  type ListComponentPropsInterface,
  type RowComponentPropsInterface,
  type ViewInterface,
} from "react-resource-view"

/**
 * The options this variant takes, on top of everything a view accepts.
 *
 * Anything declared here can be passed to the factory and read back from the
 * view. `dense` is an example: replace it with your own.
 */
export interface SpotlightViewInterface extends ViewInterface {
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
 * `useCurrentViewResourceContext` gives the rest: the resource, the loading
 * state, the filters, and the view this variant was declared with — your own
 * options included.
 */
export function SpotlightList({ rows = [] }: ListComponentPropsInterface) {
  const view = useCurrentViewResourceContext().view as SpotlightViewInterface
  const dense = view?.dense ?? false

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
 * The factory.
 *
 * `createView` fills in the id — the slug of the name — and whatever the
 * application configured as its default components. What is passed after it
 * wins, so a resource can still override any of it on the spot:
 *
 *   spotlightViewFactory({ name: "Compact", dense: true, itemsPerPage: 50 })
 */
export default function spotlightViewFactory(
  args?: Partial<SpotlightViewInterface>
): SpotlightViewInterface {
  const defaultArgs: Partial<SpotlightViewInterface> = {
    dense: false,
    ...args,
  }

  return createView({
    name: "Spotlight",
    icon: Sparkles,
    listComponent: SpotlightList,
    rowComponent: SpotlightRow,
    itemComponent: SpotlightItem,
    ...defaultArgs,
  })
}
