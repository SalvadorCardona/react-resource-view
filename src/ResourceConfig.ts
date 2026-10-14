import { FC, ReactNode } from "react"
import { ResourceDefaults } from "@/ResourceDefinition"
import { ViewResource } from "@/ViewResource"
import { ScopeConfig } from "@/scope/scopeInterface"

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
}

export interface ResourceViewConfiguration {
  /**
   * Merged beneath every resource, deeply, with the shape of a declaration:
   * `{ views: { update: { open: "drawer" } } }` makes every edit form a drawer
   * unless a resource says otherwise.
   */
  defaults?: ResourceDefaults
}

let defaults: ResourceDefaults = {}
const listeners = new Set<() => void>()

/**
 * Sets what every resource inherits. May be called before or after the
 * resources are declared: those already built are resolved again.
 */
export function configureResourceView(configuration: ResourceViewConfiguration): void {
  defaults = configuration.defaults ?? {}
  listeners.forEach((listener) => listener())
}

/** The defaults given to {@link configureResourceView}. */
export function getResourceViewDefaults(): ResourceDefaults {
  return defaults
}

/** @internal Called when the defaults change — how built resources follow them. */
export function onResourceViewDefaultsChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
