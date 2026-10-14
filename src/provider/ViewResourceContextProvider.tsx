import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import {
  ViewResourceContext,
  ViewResourceContextParams,
} from "@/ViewResourceContext"
import { useMercure } from "jsonld-api-client"
import { MultiViewTab } from "@/components/MultiViewTab"
import { ChildViewResourceDialog } from "@/components/ChildViewResourceDialog"
import MetaResourceComponent from "@/components/MetaResource"
import { toggleValue } from "@/internal/array/array"
import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { processViewResourceContext } from "@/utils/processViewResourceContext"
import { FilterInterface } from "@/views/list/filter/useFilter"
import { setUrlParam } from "@/internal/url/setUrlParam"
import { encodeQuery } from "@/internal/url/urlEncoder"
import { cleanValuesInObject } from "@/internal/object/cleanValuesInObject"
import { getLdIri, JsonLdIriAble } from "jsonld-item"
import { resolveDialect } from "@/api/apiConfig"
import {
  PermissionCache,
  PermissionCacheContext,
  usePermissionState,
} from "@/utils/permissionResource"
import { useForbiddenFallback } from "@/provider/useForbiddenFallback"
import { PageLoader } from "@/ui/Loader"
import { ActionList } from "react-data-form"
import { getOptimisticStore } from "@/api/optimistic"

export interface CurrentViewResourceContextParams extends ViewResourceContextParams {
  decoratorComponent?: FC<{ children: ReactNode }>
  onSelected?: (value: string[]) => void
}

export interface CurrentViewResourceContext extends ViewResourceContext {
  fetchData: () => void
  setSelected: (data: JsonLdIriAble) => void
  setFilter: (object: FilterInterface) => void
  /**
   * Accepts an updater, like React's own setters. Prefer that form: a plain
   * value is built from the context of the render it was read in, and would
   * revert whatever else changed in between — a request landing, a filter
   * being applied.
   */
  setViewResource: Dispatch<SetStateAction<ViewResourceContext>>
  selected: string[]
  isSelected: (data: JsonLdIriAble) => boolean
  parentResource?: ViewResourceContext
  isLoading: boolean
  error: boolean
  viewResource: ViewResourceContext
}

function DefaultDecorator({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export const CurrentResourceContext = createContext<
  CurrentViewResourceContext | undefined
>(undefined)

export default function ViewResourceContextProvider({
  id,
  decoratorComponent,
  onInitViewResource,
  ...viewResourceContextParams
}: Partial<CurrentViewResourceContextParams>) {
  const Decorator = decoratorComponent ?? DefaultDecorator
  const [selected, setSelected] = useState(viewResourceContextParams.selected ?? [])
  const parentResource = useCurrentViewResourceContext()

  useEffect(() => {
    const next = viewResourceContextParams.selected
    if (next === undefined) return
    const sameLength = next.length === selected.length
    const sameValues = sameLength && next.every((v, i) => v === selected[i])
    if (!sameValues) setSelected(next)
  }, [viewResourceContextParams.selected])

  const [viewResource, setViewResource] = useState<ViewResourceContext>(() => {
    const initial = resolveViewResourceContext({
      id,
      ...viewResourceContextParams,
    })
    return onInitViewResource ? onInitViewResource(initial, parentResource) : initial
  })

  const setFilter = (filter: FilterInterface) => {
    setViewResource((current) => ({
      ...current,
      filter,
    }))
    if (!parentResource) {
      setUrlParam("filter", encodeQuery(cleanValuesInObject(filter)))
    }
  }

  const needFetch = !viewResource?.data
  const [isLoading, setIsLoading] = useState<boolean>(needFetch)
  const [error, setError] = useState<boolean>(false)
  const fetchTokenRef = useRef(0)
  const fetchInThisTickRef = useRef<{ promise: Promise<void>; token: number } | null>(
    null
  )
  const isFirstFilterEffectRef = useRef(true)
  // When the rows on screen were asked for, on the clock of the writes in
  // flight: once drawn, the answers older than that are in them.
  const readAtRef = useRef<number | null>(null)

  if (!viewResource.view) {
    console.warn(viewResource)
    throw new Error("View not found", { cause: viewResource })
  }
  if (!viewResource.resource) {
    throw new Error("Resource not found")
  }

  const loadData = async () => {
    if (error) {
      setError(false)
    }

    const token = ++fetchTokenRef.current
    const readAt = getOptimisticStore(viewResource.resource).now()
    console.log('DBG load', viewResource.resource['@id'], viewResource.resourceAction, token)
    setIsLoading(true)

    try {
      const viewProcessed = await processViewResourceContext(viewResource)
      console.log('DBG got', viewResource.resource['@id'], token, fetchTokenRef.current, viewProcessed.data)
      if (token !== fetchTokenRef.current) return

      // A request brings back rows, nothing else. Writing the whole context
      // back would restore the one captured when the request left — undoing
      // the layout, the filter or the selection chosen while it was in flight.
      setViewResource((current) => ({ ...current, data: viewProcessed.data }))
      if (viewResource.resourceAction === ActionList.list) readAtRef.current = readAt
    } catch (e) {
      if (token !== fetchTokenRef.current) return
      console.warn("Fetch Error", e)
      setError(true)
    } finally {
      if (token === fetchTokenRef.current) setIsLoading(false)
    }
  }

  // Every button of a list hears the same save and asks for the same rows:
  // the calls made in one go share a single request.
  // A request the effect's cleanup has since invalidated — React's strict mode
  // mounts, cleans up and mounts again in one go — is not shared: its rows
  // would be dropped on arrival, and the list would stay empty.
  const fetchData = () => {
    const shared = fetchInThisTickRef.current
    if (shared && shared.token === fetchTokenRef.current) return shared.promise
    const promise = loadData()
    const current = { promise, token: fetchTokenRef.current }
    fetchInThisTickRef.current = current
    queueMicrotask(() => {
      if (fetchInThisTickRef.current === current) fetchInThisTickRef.current = null
    })
    return promise
  }

  // Only a dialect that knows a push channel names one. Strapi and Supabase
  // name none, so no EventSource is opened against a hub they do not run.
  const realtimeTopic = resolveDialect(viewResource.resource).realtimeTopic?.(
    viewResource.resource?.path ?? viewResource.resource?.["@id"]
  )

  useMercure(realtimeTopic, !!viewResource.resource.realtime).onChange(fetchData)

  useEffect(() => {
    if (needFetch) {
      fetchData()
    }
    return () => {
      fetchTokenRef.current++
    }
  }, [id, needFetch])

  // Let go of the answers the rows now hold — after they are drawn, not
  // before: dropped first, the row would show its old values for one frame.
  useEffect(() => {
    if (readAtRef.current === null) return
    getOptimisticStore(viewResource.resource).acknowledge(readAtRef.current)
    readAtRef.current = null
  }, [viewResource.data, viewResource.resource])

  useEffect(() => {
    if (isFirstFilterEffectRef.current) {
      isFirstFilterEffectRef.current = false
      return
    }
    fetchData()
  }, [viewResource.filter])

  const currentViewWithVariant = withLayout(viewResource)
  const components = currentViewWithVariant.view.components
  const ViewDecorator = components.wrapper ?? DefaultDecorator
  const View = components.view

  // The answers of the permissions asked while this data is on screen: a
  // list of fifty rows asks once per row and action, and asks again once the
  // rows are loaded again.
  const permissionCache = usePermissionCache(viewResource.data)
  const access = useRouteAccess(currentViewWithVariant, error, permissionCache)
  const forbiddenFallback = useForbiddenFallback()

  const handleSetSelect = (item: JsonLdIriAble) => {
    const iri = getLdIri(item)
    if (!iri) return

    const values = toggleValue<string>(selected, iri)
    setSelected(values)
    viewResourceContextParams.onSelected?.(values)
  }

  const isSelected = (item: JsonLdIriAble) => {
    const iri = getLdIri(item)
    if (!iri) return false

    return selected.includes(iri)
  }

  return (
    <CurrentResourceContext
      value={{
        setViewResource,
        setFilter,
        error,
        isLoading,
        ...currentViewWithVariant,
        parentResource,
        fetchData,
        selected,
        setSelected: handleSetSelect,
        viewResource: currentViewWithVariant,
        isSelected,
      }}
    >
      <PermissionCacheContext value={permissionCache}>
        <MetaResourceComponent />
        <Decorator>
          <ViewDecorator>
            {access === "allowed" ? (
              <>
                {components.top && <components.top />}
                <View />
                <MultiViewTab />
                {viewResourceContextParams.childViewResource && (
                  <ChildViewResourceDialog
                    childViewResource={viewResourceContextParams.childViewResource}
                  />
                )}
                {components.bottom && <components.bottom />}
              </>
            ) : access === "pending" ? (
              <PageLoader isLoading={true} />
            ) : (
              forbiddenFallback
            )}
          </ViewDecorator>
        </Decorator>
      </PermissionCacheContext>
    </CurrentResourceContext>
  )
}

/**
 * The context with the list's layout on screen merged into its view: the
 * layout's form, width and components win over the action's.
 */
function withLayout(context: ViewResourceContext): ViewResourceContext {
  const layouts = context.view?.layouts ?? []
  if (layouts.length === 0) return context

  const layout =
    layouts.find((candidate) => candidate.id === context.viewVariant) ?? layouts[0]

  return {
    ...context,
    layout,
    view: {
      ...context.view,
      form: layout.form ?? context.view.form,
      fullWidth: layout.fullWidth ?? context.view.fullWidth,
      components: { ...context.view.components, ...layout.components },
    },
  }
}

/** A cache of permission answers, emptied whenever `data` changes. */
function usePermissionCache(data: unknown): PermissionCache {
  const [state, setState] = useState(() => ({ data, cache: new Map() }))
  if (state.data !== data) {
    // Replaced during the render, as React allows for state derived from
    // props: the rows on screen are never checked against the old answers.
    const next = { data, cache: new Map() }
    setState(next)
    return next.cache
  }

  return state.cache
}

/**
 * Whether the action on screen is allowed — a refused action protects its
 * route, not only its button. A permission that depends on the record waits
 * for it to be loaded.
 */
function useRouteAccess(
  context: ViewResourceContext,
  failed: boolean,
  cache: PermissionCache
) {
  const action = context.resourceAction
  const needsRecord =
    action !== ActionList.list && action !== ActionList.create && Boolean(context.id)
  const permission = context.resource.permissions?.[action]
  // A record that could not be loaded is not waited for: the rule is asked
  // without it, and the view says what went wrong.
  const waitsForRecord =
    needsRecord && typeof permission === "function" && !context.data && !failed

  return usePermissionState(
    action,
    needsRecord ? context.data : undefined,
    context.resource,
    context,
    waitsForRecord,
    cache
  )
}
