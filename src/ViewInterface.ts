import { ActionList, FormInterface } from "react-data-form"
import { FC, ReactNode } from "react"
import { FormInputInterface } from "react-data-form"
import { ValueOptionInterface } from "react-data-form"
import { IdAbleInterface } from "jsonld-item"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { FilterInterface } from "@/views/list/filter/useFilter"

export type IconType = FC<{ className?: string }>

export interface RowInterface<Data extends object = any> {
  data: Data
}

export interface ViewInterface<_Read = IdAbleInterface> {
  id?: string
  name?: string
  description?: string
  icon?: IconType
  identifierKey?: string
  /**
   * The field that names a record — `email` for an account known by its
   * address. Read by the admin header and its breadcrumb to say which record
   * is on screen; without it they try `title`, `name` and `label`.
   */
  titleKey?: string
  identifierKeyList?: ValueOptionInterface[]
  behavior?: {
    /**
     * Where the action is drawn.
     *
     * `window` replaces the page. `popup` centres a dialog over it. `drawer`
     * slides a panel in — from the right on a desktop, up from the bottom on a
     * phone, which is where a hand reaches — and it is the one to pick for a
     * long form: the panel is as tall as the screen, so a record with a dozen
     * fields is read without the list behind it going anywhere.
     */
    openIn?: "popup" | "window" | "drawer"
    /**
     * The actions each row of a list offers.
     *
     * Defaults to read, update and delete. A list whose rows are already
     * editable in place has little use for a read button, and dropping it buys
     * back the width three buttons cost — so it is a per-view decision rather
     * than a fixed one. Permissions still apply on top: an action listed here
     * without the matching `can*` renders nothing.
     */
    rowActions?: ActionList[]
    closeAfterUpdate?: boolean
    refreshDataAfterUpdate?: boolean
    eventSourced?: boolean
    redirectToAfterUpdate?: string
    /**
     * Shows an export button on the list view. The export goes through the
     * API (CSV format) and honours the filters currently applied to the list.
     */
    canExport?: boolean
  }
  viewComponent?: FC
  subViewResource?: {
    viewComponent?: FC
    /**
     * Where the sub-view navigation is drawn.
     *
     * `horizontal`, the default, is a bar above the sub-view: it stays on one
     * line and scrolls sideways when the tabs run past the screen. `vertical`
     * puts the tabs in a column beside it — the shape a record with a dozen
     * sub-views wants, since a list read from top to bottom shows them all at
     * once. Below the `md` breakpoint the column would take the width the
     * sub-view needs, so it falls back to the scrolling bar.
     */
    orientation?: "horizontal" | "vertical"
    list: SubViewResourceInterface[]
  }
  viewVariants?: ViewInterface[]
  /**
   * Gives the view the page's whole width in `AdminLayout`, instead of the
   * column every other view is kept in — the shape a board, a calendar, a
   * timeline or a wide table wants. The side margins stay.
   *
   * Set on the resource's `view`, it covers every action of the resource; on
   * one of `views`, that action only; on a list variant, that variant only.
   * The most specific one wins, so a resource shown full width can still keep
   * its forms narrow with `views: { update: { fullWidth: false } }`. Defaults
   * to `false`. See {@link isFullWidthView}.
   */
  fullWidth?: boolean
  className?: string

  label?: {
    create?: string
    update?: string
    read?: string
    list?: string
    delete?: string
  }

  components?: {
    navigation?: FC
    /**
     * The title of the admin header, in place of the record's name. The back
     * link, the breadcrumb and the actions stay as they are.
     */
    title?: FC
    /**
     * The actions on the right of the admin header, in place of the ones it
     * derives from the resource's permissions.
     */
    actions?: FC
    top?: FC
    bottom?: FC
    pagination?: FC
    noResult?: FC
  }

  form?: FormInterface
  formFilter?: FormFilterInterface
  /**
   * Filters applied as long as the URL carries none of its own. They go out
   * with the very first request and pre-fill the filter form.
   *
   * A `defaultValue` on a `formFilter` input would not do: the first request
   * fires before the form exists, so the list would show something other than
   * what the filters display.
   */
  defaultFilter?: FilterInterface

  itemsPerPage?: number

  listComponent?: FC<ListComponentPropsInterface>
  rowComponent?: FC<RowComponentPropsInterface>
  itemComponent?: FC<ItemComponentPropsInterface>
}

/**
 * One sub-view — a tab — of a resource.
 *
 * It takes either of two shapes:
 * - a sub-resource: `{ resource | resourceId, resourceAction, filter?,
 *   onInitViewResource? }`, rendered through a nested
 *   ViewResourceContextProvider. The surrounding context reaches
 *   `onInitViewResource`, so filters can be derived from the current item;
 * - a free-form component: `{ slug, name, viewComponent }`.
 */
export interface SubViewResourceInterface extends ViewResourceContextParams {
  /** Tab identifier, used in the URL. Defaults to the resource's "@id". */
  slug?: string
  /** Tab label. Defaults to the resource's `name`. */
  name?: string
  description?: string
  /** Tab icon. Defaults to the resource's `icon`. */
  icon?: IconType
  /** Custom rendering, taking precedence over the resource's own. */
  viewComponent?: FC
}

export type FormFilterInterface<Data extends object = any> = FormInterface<Data> & {}

export interface ViewListInterface<
  Collection extends object = any,
> extends ViewInterface<Collection> {
  form?: FormInterface<Collection>
  itemsPerPage?: number
  formFilter?: FormFilterInterface
  defaultFilter?: FilterInterface
}

export interface ViewUpdateInterface<
  Read extends object,
  Update extends object = Read,
> extends ViewInterface<Read> {
  form?: FormInterface<Update>
}

export interface ListComponentPropsInterface<Data extends object = any> {
  rows: RowInterface<Data>[]
  children?: ReactNode
}

export interface RowComponentPropsInterface<T extends object = any> {
  row?: RowInterface<T>
  children?: ReactNode
}

export interface ItemComponentPropsInterface {
  formInput?: FormInputInterface
  children?: ReactNode
}
