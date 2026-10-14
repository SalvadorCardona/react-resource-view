import { ActionList } from "react-data-form"
import { findResource } from "@/utils/findResource"
import {
  ViewResourceContext,
  ViewResourceContextParams,
} from "@/ViewResourceContext"

export function resolveViewResourceContext(currentView: ViewResourceContextParams) {
  const resource = findResource(currentView)
  const resourceAction = currentView.resourceAction as ActionList | undefined
  const view =
    resource && resourceAction ? resource.views?.[resourceAction] : undefined

  const currentVariant =
    (currentView as ViewResourceContext).viewVariant ?? currentView.viewVariantId

  let viewVariantId: string | undefined = currentVariant
  if (view && view.layouts.length > 0) {
    const isValid =
      currentVariant !== undefined &&
      view.layouts.some((layout) => layout.id === currentVariant)
    if (!isValid) {
      viewVariantId = view.layouts[0].id
    }
  }

  // The list's initial filters apply key by key, beneath those of the URL: a
  // value the user picked stays on top, and the other initial filters still
  // apply.
  const initialFilter = view?.filters?.initial
  const filter = initialFilter
    ? { ...initialFilter, ...(currentView.filter ?? {}) }
    : currentView.filter

  return {
    ...currentView,
    resourceAction,
    resource,
    view,
    filter,
    viewVariant: viewVariantId,
  } as ViewResourceContext
}
