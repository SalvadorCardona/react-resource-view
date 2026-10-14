import { ActionList } from "react-data-form"
import { ViewResourceContext } from "@/ViewResourceContext"

/**
 * Whether the view on screen asks for the page's whole width — see `fullWidth`
 * on the declaration. Read by `AdminLayout`, and by any other wrapper that
 * wants to honour the same option.
 *
 * The most specific declaration wins: the layout on screen, then the action's
 * view — which already carries the resource's root, merged beneath it by
 * `createViewResource`. Nothing declared means `false`.
 *
 * The view is read off the resource rather than off the context: the context's
 * view has the layout merged into it, and only a list has layouts.
 */
export function isFullWidthView(
  context?: Pick<ViewResourceContext, "resource" | "resourceAction" | "viewVariant">
): boolean {
  const view = context?.resource?.views?.[context.resourceAction]
  if (!view) return false

  const layouts = context?.resourceAction === ActionList.list ? view.layouts : []
  const layout =
    layouts.find((candidate) => candidate.id === context?.viewVariant) ?? layouts[0]

  return layout?.fullWidth ?? view.fullWidth ?? false
}
