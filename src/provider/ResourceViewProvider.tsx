import { createContext, ReactNode, Suspense } from "react"

import { ResourceConfigInterface } from "@/ResourceConfig"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { Toaster } from "@/ui/sonner"
import { useResolvedViewParams } from "@/provider/useResolvedViewParams"
import { ScopeProvider, useScopeContext } from "@/scope/Scope"
import { ViewResourceContextParams } from "../ViewResourceContext"
import { PageLoader } from "@/ui/Loader"

export interface CurrentResourceFactoryComponentPropsInterface {
  viewResourceContextParams?: ViewResourceContextParams
  configuration?: ResourceConfigInterface
  children?: ReactNode
}

const ResourceContext = createContext<ResourceViewProviderContext>({})

interface ResourceViewProviderContext {
  configuration?: ResourceConfigInterface
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

  const decorator =
    configuration?.decoratorComponent ?? scopeContext?.scope?.decoratorComponent
  const hasResource = !!(
    viewResourceContextParams.resourceId || viewResourceContextParams.resource
  )

  return (
    <ResourceContext value={{ configuration }}>
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
    </ResourceContext>
  )
}
