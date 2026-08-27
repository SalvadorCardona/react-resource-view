import { FormInterface } from "react-data-form"
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
  identifierKeyList?: ValueOptionInterface[]
  behavior?: {
    openIn?: "popup" | "window"
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
    list: SubViewResourceInterface[]
  }
  viewVariants?: ViewInterface[]
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
