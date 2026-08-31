import { useLocation } from "@/ports"

import { useScopeContext } from "@/scope/Scope"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { ActionList } from "react-data-form"
import { decodeQuery } from "@/internal/url/urlEncoder"
import { FilterInterface } from "@/views/list/filter/useFilter"

// Read through the router rather than window.location: the latter is invisible
// to React Compiler, which then memoises the first render's value and never
// re-reads the URL params on a client-side navigation.
function useUrlParamDecoded(paramKey: string): unknown | undefined {
  const { searchStr } = useLocation()
  const queryParam = new URLSearchParams(searchStr).get(paramKey) ?? undefined

  return queryParam ? decodeQuery(queryParam) : undefined
}

/** The same, for a parameter that is a plain string rather than an encoded object. */
function useUrlParam(paramKey: string): string | undefined {
  const { searchStr } = useLocation()

  return new URLSearchParams(searchStr).get(paramKey) ?? undefined
}

export function useResolvedViewParams(
  parent?: ViewResourceContextParams
): ViewResourceContextParams {
  const scopeContext = useScopeContext()
  const urlDefaultData = useUrlParamDecoded("defaultData")
  const urlFilter = useUrlParamDecoded("filter") as FilterInterface
  const urlVariant = useUrlParam("variant")
  const scopeDefaults = scopeContext?.scope?.defaultViewResourceContextParams

  return {
    scope: scopeContext?.scope?.name,
    resourceAction:
      parent?.resourceAction ?? scopeDefaults?.resourceAction ?? ActionList.list,
    id: parent?.id ?? scopeDefaults?.id,
    resource: parent?.resource ?? scopeDefaults?.resource,
    resourceId: parent?.resourceId ?? scopeDefaults?.resourceId,
    subResource: parent?.subResource,
    childViewResource: parent?.childViewResource,
    data: parent?.data,
    defaultData:
      parent?.defaultData ??
      (typeof urlDefaultData === "object" ? (urlDefaultData as object) : undefined),
    filter: typeof urlFilter === "object" ? (urlFilter as object) : undefined,
    // These params are rebuilt one field at a time, so anything not named here
    // is dropped on the way in. The chosen layout was: a host handing one to
    // `ResourceViewProvider`, or a link carrying one, both lost it and landed
    // on the first variant declared.
    viewVariantId:
      parent?.viewVariantId ?? urlVariant ?? scopeDefaults?.viewVariantId,
  }
}
