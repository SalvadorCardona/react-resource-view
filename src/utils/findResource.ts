import { ViewResource } from "@/ViewResource"
import { getResource, resourceRegistered } from "resource-registry"

interface ParamSearch {
  resourceId?: string
  scope?: string
  resource?: ViewResource
}

export function findResource({
  scope,
  resourceId,
  resource: resourceQuery,
}: ParamSearch): ViewResource | undefined {
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
      return scopedResult as ViewResource
    }
  }

  const resource = getResource(resourceId) as ViewResource

  if (resource) {
    return resource
  }

  return metadata.find((e) => {
    if (e.id === resourceId || e.alias === resourceId) {
      return true
    }
  }) as ViewResource | undefined
}
