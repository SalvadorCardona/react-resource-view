import * as React from "react"
import { ComponentType, FC, ReactNode } from "react"

/**
 * What the views need from the application hosting them.
 *
 * The package renders CRUD views over a JSON-LD API; it deliberately knows
 * neither which router the application uses nor where its API lives. Both come
 * from here, set once at startup through {@link configurePorts}.
 */

/** Where a navigation should go. */
export interface NavigateOptions {
  to: string
  replace?: boolean
  /**
   * Whether the router should scroll back to the top. The views set it to
   * false when switching tabs, to keep the reading position.
   */
  resetScroll?: boolean
}

/** Props of the link component, mirroring an anchor. */
export interface LinkPropsInterface
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string
  children?: ReactNode
}

/**
 * The four router primitives the views use.
 *
 * Any router can satisfy this. An adapter for TanStack Router ships with the
 * package:
 *
 * ```ts
 * import { tanstackAdapter } from "react-resource-view/tanstack"
 * configurePorts({ navigation: tanstackAdapter })
 * ```
 */
export interface NavigationPortInterface {
  /**
   * Returns the imperative navigate function. Called as a hook.
   *
   * Routers that resolve navigation asynchronously may return a promise; the
   * views await it when they need to act once the URL has changed.
   */
  useNavigate: () => (options: NavigateOptions) => Promise<void> | void
  /**
   * Current location. `searchStr` is the raw query string, read reactively so
   * a client-side navigation re-renders the views that depend on it.
   */
  useLocation: () => {
    pathname: string
    searchStr: string
    search?: Record<string, unknown>
  }
  /** Renders an anchor handled by the router. */
  Link: ComponentType<LinkPropsInterface>
  /** Redirects on render. */
  Navigate: ComponentType<{ to: string; replace?: boolean }>
}

/**
 * How a view context is written into the URL.
 *
 * `path` puts it in the path — `/admin/articles/update/42` — which reads well
 * and is the default.
 *
 * `query` keeps it entirely in the query string —
 * `/docs.html?view=admin/articles/update/42`. Use it when the path is not
 * yours to control: static hosting, where a deep path has no server to answer
 * it and returns 404, or views embedded in an existing page.
 */
export interface RoutingPortInterface {
  mode: "path" | "query"
  /** Name of the query parameter carrying the context in `query` mode. */
  param: string
  /** Path the links point at in `query` mode, before the `?`. */
  basePath: string
}

export interface ResourceViewPortsInterface {
  navigation: NavigationPortInterface
  routing: RoutingPortInterface
  /**
   * Root URL of the application, used to build absolute links that must escape
   * an iframe. Defaults to the current origin.
   */
  appUrl: string
  /** Whether to render development affordances, such as the metadata panel. */
  isDev: boolean

  /** Application name, used as the page title suffix. */
  appName: string

  /** Description written into the page metadata. */
  description: string
}

const isBrowser = (): boolean => typeof window !== "undefined"

/**
 * Fallback navigation: full page loads through the History API.
 *
 * It keeps the views working — in a story, a test, a page rendered without a
 * router — but loses client-side routing. Supply a real adapter in production.
 */
const fallbackNavigation: NavigationPortInterface = {
  useNavigate: () => (options: NavigateOptions) => {
    if (!isBrowser()) return
    if (options.replace) window.location.replace(options.to)
    else window.location.assign(options.to)
  },
  useLocation: () => ({
    pathname: isBrowser() ? window.location.pathname : "/",
    searchStr: isBrowser() ? window.location.search : "",
    search: undefined,
  }),
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  Navigate: ({ to, replace }) => {
    if (isBrowser()) {
      if (replace) window.location.replace(to)
      else window.location.assign(to)
    }
    return null
  },
}

let ports: ResourceViewPortsInterface = {
  navigation: fallbackNavigation,
  routing: { mode: "path", param: "view", basePath: "" },
  appUrl: isBrowser() ? window.origin : "http://localhost",
  isDev: false,
  appName: "",
  description: "",
}

export function getPorts(): ResourceViewPortsInterface {
  return ports
}

/** Settings accepted by {@link configurePorts}; everything is optional. */
export interface ConfigurePortsInput
  extends Partial<Omit<ResourceViewPortsInterface, "routing">> {
  routing?: Partial<RoutingPortInterface>
}

/**
 * Wires the host application into the views. Call it once at startup, before
 * the first view is rendered.
 */
export function configurePorts(newPorts: ConfigurePortsInput): void {
  ports = {
    ...ports,
    ...newPorts,
    routing: { ...ports.routing, ...newPorts.routing },
  }
}

/** Reads the navigate function through the configured router. */
export const useNavigate = (): ((
  options: NavigateOptions
) => Promise<void> | void) => getPorts().navigation.useNavigate()

/** Reads the current location through the configured router. */
export const useLocation = (): {
  pathname: string
  searchStr: string
  search?: Record<string, unknown>
} => getPorts().navigation.useLocation()

/** The configured router's link component. */
export const Link: FC<LinkPropsInterface> = (props) => {
  const Component = getPorts().navigation.Link
  return <Component {...props} />
}

/** The configured router's redirect component. */
export const Navigate: FC<{ to: string; replace?: boolean }> = (props) => {
  const Component = getPorts().navigation.Navigate
  return <Component {...props} />
}
