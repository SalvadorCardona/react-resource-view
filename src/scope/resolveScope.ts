import { createItemMenuWithResource, MenuItemInterface } from "@/menu/menu"
import { getCurrentScope } from "@/scope/scope"
import type { ViewResource } from "@/ViewResource"
import type {
  ResolvedScope,
  ScopeInterface,
  ScopeMenuEntry,
} from "@/scope/scopeInterface"

function isViewResource(value: unknown): value is ViewResource {
  return (value as ViewResource | undefined)?.["@type"] === "view-resource"
}

/** The scopes each resource is listed by, in the order they loaded. */
const memberships = new WeakMap<ViewResource, string[]>()

/**
 * Ties resources to a scope: their links lead into it. A resource listed by
 * several scopes links within the one on screen when it is one of them, and
 * within the first that loaded otherwise.
 */
export function adoptResources(scopeName: string, resources?: ViewResource[]): void {
  for (const resource of resources ?? []) {
    let scopes = memberships.get(resource)
    if (!scopes) {
      scopes = []
      memberships.set(resource, scopes)
      const own = scopes
      Object.defineProperty(resource, "scope", {
        configurable: true,
        enumerable: true,
        get: () => {
          const current = getCurrentScope()
          return own.includes(current) ? current : own[0]
        },
        // Set by hand, a scope comes first.
        set: (value: string | undefined) => {
          if (value && !own.includes(value)) own.unshift(value)
        },
      })
    }
    if (!scopes.includes(scopeName)) scopes.push(scopeName)
  }
}

function resolveEntry(entry: ScopeMenuEntry, scope: string): MenuItemInterface {
  if (isViewResource(entry)) {
    return createItemMenuWithResource({ resource: entry, scope })
  }

  return {
    ...entry,
    items: entry.items?.map((item) => resolveEntry(item, scope)),
  }
}

/**
 * A scope as it loads: its resources tied to it, its menu turned into links
 * — `"auto"` listing the resources in order.
 */
export function resolveScope(scope: ScopeInterface): ResolvedScope {
  adoptResources(scope.name, scope.resources)

  const entries =
    scope.menu === "auto" ? (scope.resources ?? []) : (scope.menu ?? undefined)

  return {
    ...scope,
    menu: entries?.map((entry) => resolveEntry(entry, scope.name)),
  }
}
