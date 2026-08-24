import { ViewInterface } from "@/ViewInterface"
import { findResource } from "@/utils/findResource"
import {
  ViewResourceContext,
  ViewResourceContextParams,
} from "@/ViewResourceContext"

function getViewFromResource({
  resource,
  resourceAction,
}: ViewResourceContextParams): ViewInterface<any> | undefined {
  if (!resource || !resourceAction) {
    return undefined
  }

  return resource?.views?.[resourceAction]
}

export function resolveViewResourceContext(currentView: ViewResourceContextParams) {
  const resource = findResource(currentView)

  const view = getViewFromResource({
    resource,
    resourceAction: currentView.resourceAction,
  })

  const currentVariant =
    (currentView as ViewResourceContext).viewVariant ?? currentView.viewVariantId

  let viewVariantId: string | undefined = currentVariant
  if (view?.viewVariants && view.viewVariants.length > 0) {
    const isValid =
      currentVariant !== undefined &&
      view.viewVariants.some((variant) => variant.id === currentVariant)
    if (!isValid) {
      viewVariantId = view.viewVariants[0].id
    }
  }

  // The view's default filters apply key by key, beneath those of
  // l'URL : une valeur choisie par l'utilisateur reste prioritaire, et les
  // the other default filters still apply.
  const defaultFilter = view?.defaultFilter
  const filter = defaultFilter
    ? { ...defaultFilter, ...(currentView.filter ?? {}) }
    : currentView.filter

  return {
    ...currentView,
    resource,
    view,
    filter,
    viewVariant: viewVariantId,
  } as ViewResourceContext
}
