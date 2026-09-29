import { useScopeContext } from "@/scope/Scope"
import { MenuItemInterface, useIsActiveItemMenu } from "@/menu/menu"

/**
 * Whether a menu entry of the current scope points at the page on screen.
 *
 * {@link useIsActiveItemMenu}, told which page a bare URL opens on: the scope's
 * `defaultViewResourceContextParams`. The admin shell opens on that page before
 * the reader has clicked anything, and its entry has to be lit then too.
 */
export function useIsActiveMenuEntry(): (item: MenuItemInterface) => boolean {
  const scope = useScopeContext()?.scope

  return useIsActiveItemMenu(
    scope && { ...scope.defaultViewResourceContextParams, scope: scope.name }
  )
}
