import { createContext, ReactNode, use, useEffect } from "react"
import { setCurrentScope } from "@/scope/scope"
import {
  ForbiddenError,
  ScopeConfig,
  ScopeInterface,
  UnauthorizedError,
} from "@/scope/scopeInterface"

type Scope = string | undefined

interface ScopeContextValue {
  scope: ScopeInterface
}

const ScopeContext = createContext<ScopeContextValue | undefined>(undefined)

const scopePromiseCache = new Map<string, Promise<ScopeInterface>>()

function getScopePromise(
  scopeName: string,
  configScope: ScopeConfig
): Promise<ScopeInterface> {
  let promise = scopePromiseCache.get(scopeName)
  if (!promise) {
    const fn = configScope[scopeName]
    promise = fn ? fn() : Promise.reject(new Error("Scope not found"))
    scopePromiseCache.set(scopeName, promise)
  }
  return promise
}

interface ScopeProviderParams {
  scopeName: Scope
  children: ReactNode
  configScope: ScopeConfig
  unauthorizedError?: () => void
  defaultScope?: Scope
}

export const ScopeProvider = ({
  scopeName: parentScopeName,
  children,
  configScope,
  unauthorizedError,
  defaultScope,
}: ScopeProviderParams) => {
  const scopeName = parentScopeName ?? defaultScope

  if (!scopeName) {
    throw new Error("Scope not found")
  }

  const scope = use(getScopePromise(scopeName, configScope))

  useEffect(() => {
    setCurrentScope(scopeName)
  }, [scopeName])

  useEffect(() => {
    if (!scope.authorization) return

    try {
      scope.authorization()
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        if (unauthorizedError) {
          unauthorizedError()
          return
        }
        window.location.href = "/"
        return
      }

      if (e instanceof ForbiddenError) {
        throw new Error("You are not authorized", { cause: e })
      }

      throw e
    }
  }, [scope, unauthorizedError])

  return <ScopeContext.Provider value={{ scope }}>{children}</ScopeContext.Provider>
}

export const useScopeContext = () => {
  return use(ScopeContext)
}
