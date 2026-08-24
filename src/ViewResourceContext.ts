import {
  LimitInterface,
  ViewResourceInterface,
} from "@/ViewResourceInterface"
import { ActionList } from "react-data-form"
import { FilterInterface } from "@/views/list/filter/useFilter"
import { JsonLdIri } from "jsonld-item"
import { ViewInterface } from "@/ViewInterface"

export interface ViewResourceContextParams {
  id?: string | JsonLdIri | null
  resourceId?: ViewResourceInterface["@id"] | string
  resourceAction?: ActionList
  data?: object
  filter?: FilterInterface
  scope?: string
  resource?: ViewResourceInterface
  subResource?: string
  viewVariantId?: string
  view?: ViewInterface<any>
  defaultData?: object
  selected?: string[]
  /**
   * Limit injected at runtime, for instance by a field rendering a nested
   * view. Carried on the context and read by `ResourceViewButton` to drive the
   * create button of that nested view from outside — how many items are
   * selected, a quota, and so on.
   */
  limit?: LimitInterface
  childViewResource?: ViewResourceContextParams
  /**
   * Initialisation hook for the context, used to derive filter, defaultData
   * and the like. `parentViewResource` is the surrounding context — the current
   * item, when this view is rendered as a sub-resource of another.
   */
  onInitViewResource?: (
    viewResource: ViewResourceContext,
    parentViewResource?: ViewResourceContext
  ) => ViewResourceContext
}

export interface ViewResourceContext {
  id?: string | JsonLdIri | null
  resourceId: ViewResourceInterface["@id"] | string
  resourceAction: ActionList
  data?: object
  filter?: FilterInterface
  scope?: string
  resource: ViewResourceInterface
  defaultData?: object
  subResource?: string
  viewVariant?: string
  view: ViewInterface<any>
  selected?: string[]
  limit?: LimitInterface
  childViewResourceContext?: ViewResourceContext
}
