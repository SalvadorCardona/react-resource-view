import { ViewResourceInterface } from "@/ViewResourceInterface"
import { getResource, resourceRegistered } from "resource-registry"

interface ParamSearch {
  resourceId?: string
  scope?: string
  resource?: ViewResourceInterface
}

export function findResource({
  scope,
  resourceId,
  resource: resourceQuery,
}: ParamSearch): ViewResourceInterface | undefined {
  if (resourceQuery) {
    return resourceQuery
  }

  if (!resourceId) {
    return undefined
  }

  const metadata = Object.keys(resourceRegistered).map((e) => resourceRegistered[e])

  // The current scope wins, so one URL path can be served by a scope-specific
  // variant of the resource.
  if (scope) {
    const scopedResult = metadata.find((e) => {
      if (
        e.scope === scope &&
        (e["@id"] === resourceId || e.id === resourceId || e.alias === resourceId)
      ) {
        return true
      }
    })

    if (scopedResult) {
      return scopedResult as ViewResourceInterface
    }
  }

  const resource = getResource(resourceId) as ViewResourceInterface

  if (resource) {
    return resource
  }

  return metadata.find((e) => {
    if (e.id === resourceId || e.alias === resourceId) {
      return true
    }
  }) as ViewResourceInterface | undefined
}
