import { generateLink } from "@/routes/routes"
import { ActionList } from "react-data-form"
import { getIdFromIri } from "jsonld-item"
import { FC } from "react"
import { IconType } from "@/ViewInterface"
import { getCurrentScope } from "@/scope/scope"
import { getPorts } from "@/ports"
import { ViewResourceContextParams } from "@/ViewResourceContext"

export interface MenuItemInterface {
  name: string
  icon?: IconType
  href?: string
  items?: MenuItemInterface[]
  hidden?: boolean
  isSelected?: boolean
  component?: FC<{ menuItem: MenuItemInterface }>
  priority?: number
  /**
   * When true and the current page matches one of this entry's `items`, the
   * header renders a sub-navigation bar
   * so the reader can move between those sibling pages.
   */
  subNavigation?: boolean
  /**
   * Evaluated on render: when true the item is locked — a badge with a padlock
   * is shown and clicking it redirects to the subscription page
   * au lieu de la destination habituelle.
   */
  locked?: () => boolean
}

export function createItemMenuWithResource({
  resource,
  resourceId: parentResourceId,
  scope: currentScope,
  resourceAction: currentResourceAction,
  id,
}: ViewResourceContextParams): MenuItemInterface {
  if (!parentResourceId && !resource) {
    throw new Error("resourceId or resource is required")
  }

  const name = resource?.name ?? (resource?.["@id"] as string)
  const resourceId = parentResourceId ?? (resource?.["@id"] as string)
  const scope = currentScope ?? resource?.scope ?? getCurrentScope()
  const resourceAction = currentResourceAction ?? ActionList.list

  return {
    icon: resource?.icon,
    name: getIdFromIri(name),
    href: generateLink({
      resourceId,
      scope,
      resourceAction,
      id,
    }),
  }
}

/**
 * Whether a menu entry points at what is currently on screen.
 *
 * In query mode the context lives in the query string, so comparing the
 * pathname alone would match every entry — or none.
 */
export function isActiveItemMenu(item: MenuItemInterface) {
  if (!item.href) return false

  const current =
    getPorts().routing.mode === "query"
      ? window.location.pathname + window.location.search
      : window.location.pathname

  return current.startsWith(item.href)
}
