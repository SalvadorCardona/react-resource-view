import { useSyncExternalStore } from "react"
import { configurePorts, getPorts, type NavigationPortInterface } from "@/ports"
import { parseLink } from "@/routes/routes"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import type { ResourceConfigInterface } from "@/ResourceConfig"

/**
 * A router for the tests: the URL lives in jsdom's `window.history`, a link
 * pushes onto it, `history.back()` pops it — so what a test exercises is the
 * URL, as an application with a real router would.
 */

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("popstate", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("popstate", listener)
  }
}

const currentUrl = () => window.location.pathname + window.location.search

export function navigateTo(to: string, replace = false) {
  if (replace) window.history.replaceState(null, "", to)
  else window.history.pushState(null, "", to)
  notify()
}

export const memoryNavigation: NavigationPortInterface = {
  useNavigate: () => (options) => navigateTo(options.to, options.replace),
  useLocation: () => {
    const url = useSyncExternalStore(subscribe, currentUrl)
    const [pathname, search = ""] = url.split("?")

    return { pathname, searchStr: search ? "?" + search : "" }
  },
  Link: ({ to, children, onClick, ...rest }) => (
    <a
      href={to}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigateTo(to)
      }}
    >
      {children}
    </a>
  ),
  Navigate: () => null,
}

const originalNavigation = getPorts().navigation

/** Starts the tests' router at `url`; returns what puts the original back. */
export function startMemoryRouter(url: string): () => void {
  window.history.replaceState(null, "", url)
  configurePorts({ navigation: memoryNavigation })

  return () => configurePorts({ navigation: originalNavigation })
}

/** The application: the views of whatever the URL says. */
export function RoutedViews({
  configuration,
}: {
  configuration: ResourceConfigInterface
}) {
  const url = useSyncExternalStore(subscribe, currentUrl)

  return (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(url)}
      configuration={configuration}
    />
  )
}

export const currentLocation = currentUrl
