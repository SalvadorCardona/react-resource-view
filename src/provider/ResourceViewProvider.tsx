import { ReactNode, Suspense } from "react"

import { ResourceConfigInterface } from "@/ResourceConfig"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { Toaster } from "@/ui/sonner"
import { useResolvedViewParams } from "@/provider/useResolvedViewParams"
import { ScopeProvider, useScopeContext } from "@/scope/Scope"
import { ViewResourceContextParams } from "../ViewResourceContext"
import { PageLoader } from "@/ui/Loader"
import { ResourceViewConfigurationContext } from "@/provider/ResourceViewConfigurationContext"
import { adoptResources } from "@/scope/resolveScope"

export interface CurrentResourceFactoryComponentPropsInterface {
  viewResourceContextParams?: ViewResourceContextParams
  configuration?: ResourceConfigInterface
  children?: ReactNode
}

export default function ResourceViewProvider({
  viewResourceContextParams,
  configuration,
  children,
}: CurrentResourceFactoryComponentPropsInterface) {
  if (configuration?.scopes) {
    return (
      <Suspense
        fallback={configuration.scopeFallback ?? <PageLoader isLoading={true} />}
      >
        <ScopeProvider
          scopeName={viewResourceContextParams?.scope}
          configScope={configuration.scopes}
          defaultScope={configuration.defaultScope}
          unauthorizedError={configuration.onUnauthorized}
          authorizationFallback={configuration.authorizationFallback}
          forbiddenFallback={configuration.forbiddenFallback}
        >
          <ResourceViewProviderInner
            viewResourceContextParams={viewResourceContextParams}
            configuration={configuration}
          >
            {children}
          </ResourceViewProviderInner>
        </ScopeProvider>
      </Suspense>
    )
  }

  return (
    <ResourceViewProviderInner
      viewResourceContextParams={viewResourceContextParams}
      configuration={configuration}
    >
      {children}
    </ResourceViewProviderInner>
  )
}

function ResourceViewProviderInner({
  viewResourceContextParams: parentParams,
  configuration,
  children,
}: CurrentResourceFactoryComponentPropsInterface) {
  const scopeContext = useScopeContext()
  const viewResourceContextParams = useResolvedViewParams(parentParams)

  // An application without scopes still names one for its links: the
  // resources it was given link within it.
  const scopeName =
    viewResourceContextParams.scope ?? parentParams?.scope ?? configuration?.defaultScope
  if (scopeName) adoptResources(scopeName, configuration?.resources)

  const decorator =
    configuration?.decoratorComponent ?? scopeContext?.scope?.decoratorComponent
  const hasResource = !!(
    viewResourceContextParams.resourceId || viewResourceContextParams.resource
  )

  return (
    <ResourceViewConfigurationContext value={{ configuration }}>
      {hasResource ? (
        <ViewResourceContextProvider
          key={
            (viewResourceContextParams.resourceId ?? "") +
            (viewResourceContextParams.id ?? "") +
            viewResourceContextParams.resourceAction +
            JSON.stringify(viewResourceContextParams.defaultData ?? "")
          }
          decoratorComponent={decorator}
          {...viewResourceContextParams}
        />
      ) : (
        children
      )}
      <Toaster />
    </ResourceViewConfigurationContext>
  )
}
