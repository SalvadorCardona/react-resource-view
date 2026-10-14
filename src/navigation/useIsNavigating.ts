import { useSyncExternalStore } from "react"
import {
  isNavigationActive,
  subscribeToNavigation,
} from "@/navigation/navigationState"

/**
 * Whether the application is moving to another view: from the click until the
 * new view has its data. Works with any router — see
 * `NavigationPortInterface.useIsNavigating` for what the router adds.
 *
 * True at once: an indicator built on it should wait a little before showing
 * itself, so an instant navigation does not flash it — the component given to
 * `navigationLoader` receives a value that already does.
 */
export function useIsNavigating(): boolean {
  return useSyncExternalStore(subscribeToNavigation, isNavigationActive, () => false)
}
