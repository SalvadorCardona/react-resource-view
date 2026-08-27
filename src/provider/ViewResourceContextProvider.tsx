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
import { buildTopic } from "jsonld-api-client"
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
  const isFirstFilterEffectRef = useRef(true)

  if (!viewResource.view) {
    console.warn(viewResource)
    throw new Error("View not found", { cause: viewResource })
  }
  if (!viewResource.resource) {
    throw new Error("Resource not found")
  }

  const fetchData = async () => {
    if (error) {
      setError(false)
    }

    const token = ++fetchTokenRef.current
    setIsLoading(true)

    try {
      const viewProcessed = await processViewResourceContext(viewResource)
      if (token !== fetchTokenRef.current) return

      // A request brings back rows, nothing else. Writing the whole context
      // back would restore the one captured when the request left — undoing
      // the layout, the filter or the selection chosen while it was in flight.
      setViewResource((current) => ({ ...current, data: viewProcessed.data }))
    } catch (e) {
      if (token !== fetchTokenRef.current) return
      console.warn("Fetch Error", e)
      setError(true)
    } finally {
      if (token === fetchTokenRef.current) setIsLoading(false)
    }
  }

  useMercure(
    buildTopic(viewResource.resource?.path ?? viewResource.resource?.["@id"]),
    !!viewResource.view?.behavior?.eventSourced
  ).onChange(fetchData)

  useEffect(() => {
    if (needFetch) {
      fetchData()
    }
    return () => {
      fetchTokenRef.current++
    }
  }, [id, needFetch])

  useEffect(() => {
    if (isFirstFilterEffectRef.current) {
      isFirstFilterEffectRef.current = false
      return
    }
    fetchData()
  }, [viewResource.filter])

  const ViewDecorator =
    viewResource?.resource?.decoratorComponent ?? DefaultDecorator
  const View = viewResource.view.viewComponent

  if (!View) {
    throw new Error("View is undefined")
  }

  const currentViewWithVariant = {
    ...viewResource,
    ...currentVariantView(viewResource),
  }

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
      <MetaResourceComponent />
      <Decorator>
        <ViewDecorator>
          {viewResource?.view?.components?.top && (
            <viewResource.view.components.top />
          )}
          <View />
          <MultiViewTab />
          {viewResourceContextParams.childViewResource && (
            <ChildViewResourceDialog
              childViewResource={viewResourceContextParams.childViewResource}
            />
          )}
          {viewResource?.view?.components?.bottom && (
            <viewResource.view.components.bottom />
          )}
        </ViewDecorator>
      </Decorator>
    </CurrentResourceContext>
  )
}

function currentVariantView(
  currentResource: ViewResourceContext
): ViewResourceContext {
  if (
    currentResource.view?.viewVariants &&
    currentResource.view.viewVariants.length > 0
  ) {
    const idViewVariant = currentResource.viewVariant
    const currentDefaultViewOption = currentResource.view.viewVariants[0]
    const currentDefaultView =
      currentResource.view.viewVariants.find(
        (viewOption) => viewOption.id === idViewVariant
      ) ?? currentDefaultViewOption

    return {
      ...currentResource,
      view: {
        ...currentResource.view,
        ...currentDefaultView,
        // The view's human-readable name — the page title — must not be lost
        // par l'identifiant du variant (ex. "card").
        name: currentResource.view.name ?? currentDefaultView.name,
      },
    } as CurrentViewResourceContext
  }

  return currentResource
}
