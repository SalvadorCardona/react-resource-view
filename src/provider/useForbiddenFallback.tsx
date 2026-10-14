import { ReactNode } from "react"
import { AccessDenied, useScopeContext } from "@/scope/Scope"
import { useResourceViewConfiguration } from "@/provider/ResourceViewConfigurationContext"

/**
 * What is drawn in place of a view the user may not see: the scope's
 * `forbiddenFallback`, then the configuration's, then "Access denied".
 */
export function useForbiddenFallback(): ReactNode {
  const scope = useScopeContext()?.scope
  const configuration = useResourceViewConfiguration()

  return scope?.forbiddenFallback ?? configuration?.forbiddenFallback ?? <AccessDenied />
}
