let currentScope: ScopeListDef["scope"] | undefined = undefined

export interface ScopeListDef {
  scope: string
}

export function getCurrentScope() {
  return currentScope ?? extractScopeFromUrl() ?? "public"
}

function extractScopeFromUrl(): ScopeListDef["scope"] | undefined {
  if (typeof window === "undefined") return undefined

  const [firstSegment] = window.location.pathname.split("/").filter(Boolean)

  return firstSegment as ScopeListDef["scope"] | undefined
}

export function setCurrentScope(scope: ScopeListDef["scope"] | undefined) {
  currentScope = scope
}
