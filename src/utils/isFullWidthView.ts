import { ActionList } from "react-data-form"
import { ViewResourceContext } from "@/ViewResourceContext"

/**
 * Whether the view on screen asks for the page's whole width — see
 * `ViewInterface.fullWidth`. Read by `AdminLayout`, and by any other
 * `decoratorComponent` that wants to honour the same option.
 *
 * The most specific declaration wins: the list variant on screen, then the
 * action's view — which already carries the resource's `view`, merged beneath
 * it by `createViewResource`. Nothing declared means `false`.
 *
 * The view is read off the resource rather than off the context: the context's
 * view has the first variant merged into it for every action, so a board
 * declared full width would otherwise widen the edit form too.
 */
export function isFullWidthView(
  context?: Pick<ViewResourceContext, "resource" | "resourceAction" | "viewVariant">
): boolean {
  const view = context?.resource?.views?.[context.resourceAction]
  if (!view) return false

  // Variants are a list's layouts; any other action draws a single one.
  const variants =
    context?.resourceAction === ActionList.list ? (view.viewVariants ?? []) : []
  const variant =
    variants.find((candidate) => candidate.id === context?.viewVariant) ??
    variants[0]

  return variant?.fullWidth ?? view.fullWidth ?? false
}
