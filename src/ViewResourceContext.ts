import { ActionList } from "react-data-form"
import { FilterInterface } from "@/views/list/filter/useFilter"
import { JsonLdIri } from "jsonld-item"
import type { ResolvedView, ViewResource } from "@/ViewResource"
import type { Action, Quota } from "@/ResourceDefinition"
import type { ResolvedLayout } from "@/layout/layout"

export interface ViewResourceContextParams {
  id?: string | JsonLdIri | null
  resourceId?: ViewResource["@id"] | string
  /** `"update"`, or `ActionList.update`. */
  resourceAction?: Action
  data?: object
  filter?: FilterInterface
  scope?: string
  resource?: ViewResource
  subResource?: string
  viewVariantId?: string
  view?: ResolvedView
  defaultData?: object
  selected?: string[]
  /**
   * A creation quota injected at runtime, for instance by a field rendering a
   * nested view. Read by `ResourceViewButton` when the resource declares none,
   * to drive the create button of that nested view from outside — how many
   * items are selected, a plan's allowance.
   */
  quota?: Quota
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
  resourceId: ViewResource["@id"] | string
  resourceAction: ActionList
  data?: object
  filter?: FilterInterface
  scope?: string
  resource: ViewResource
  defaultData?: object
  subResource?: string
  /** The id of the list's layout on screen. */
  viewVariant?: string
  /**
   * The action's view, every level of the declaration merged — and, on a
   * list, the layout on screen merged into it: its form, its components.
   */
  view: ResolvedView
  /** The list's layout on screen; its own options are in `layout.options`. */
  layout?: ResolvedLayout
  selected?: string[]
  quota?: Quota
  childViewResourceContext?: ViewResourceContext
}
