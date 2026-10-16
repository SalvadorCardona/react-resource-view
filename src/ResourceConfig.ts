import { FC, ReactNode } from "react"
import { ResourceDefaults } from "@/ResourceDefinition"
import { ViewResource } from "@/ViewResource"
import { ScopeConfig } from "@/scope/scopeInterface"
import type { NavigationLoader } from "@/navigation/NavigationIndicator"
import type { OpenFrame } from "@/open/open"

/** What `ResourceViewProvider` is configured with. */
export interface ResourceConfigInterface {
  decoratorComponent?: FC<{ children: ReactNode }>
  /**
   * The resources of an application without scopes. With `defaultScope`, they
   * link within it.
   */
  resources?: ViewResource[]
  scopes?: ScopeConfig
  defaultScope?: string
  onUnauthorized?: () => void
  scopeFallback?: ReactNode
  authorizationFallback?: ReactNode
  forbiddenFallback?: ReactNode
  /**
   * What shows while moving from one view to the next, until the new view has
   * its data: a thin bar along the top of the screen by default. A node or a
   * component replaces it; `false` shows nothing.
   */
  navigationLoader?: NavigationLoader
  /**
   * Whether a view fades in when it appears, sliding up a little unless the
   * user prefers reduced motion. True by default.
   */
  viewTransition?: boolean
}

export interface ResourceViewConfiguration {
  /**
   * Merged beneath every resource, deeply, with the shape of a declaration:
   * `{ views: { update: { open: "drawer" } } }` makes every edit form a drawer
   * unless a resource says otherwise.
   */
  defaults?: ResourceDefaults
  /**
   * Frames of one's own, by name: `{ open: { accordion } }` lets any view
   * write `open: "accordion"` — see `open.custom()`.
   */
  open?: Record<string, OpenFrame>
}

let defaults: ResourceDefaults = {}
let frames: Record<string, OpenFrame> = {}
const listeners = new Set<() => void>()

/**
 * Sets what every resource inherits. May be called before or after the
 * resources are declared: those already built are resolved again.
 */
export function configureResourceView(
  configuration: ResourceViewConfiguration
): void {
  defaults = configuration.defaults ?? {}
  frames = configuration.open ?? {}
  listeners.forEach((listener) => listener())
}

/** The defaults given to {@link configureResourceView}. */
export function getResourceViewDefaults(): ResourceDefaults {
  return defaults
}

/** The frames given to {@link configureResourceView}, by name. */
export function getRegisteredOpenFrames(): Record<string, OpenFrame> {
  return frames
}

/** @internal Called when the defaults change — how built resources follow them. */
export function onResourceViewDefaultsChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
