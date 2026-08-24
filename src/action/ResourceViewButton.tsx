import { ReactNode, useEffect } from "react"
import { Button } from "@/ui/button"
import { generateLink } from "@/routes/routes"
import { ActionList } from "react-data-form"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { permissionResource } from "@/utils/permissionResource"
import { Trans } from "react-mini-i18n"
import { Link, useNavigate } from "@/ports"
import { Edit, Eye, Plus, Trash } from "lucide-react"
import { useBoolean } from "@/internal/useBoolean"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { getResourceConfig } from "@/ResourceConfig"
import { ButtonGroup } from "@/ui/button-group"
import { Dialog, DialogContent, DialogDescription } from "@/ui/dialog"
import { ScrollArea } from "@/ui/scroll-area"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { useLimit } from "@/hook/useLimit"

export interface ResourceButtonProps extends ViewResourceContextParams {
  action: ActionList
  label?: string | ReactNode
  children?: ReactNode
}

const ACTION_ICONS = {
  [ActionList.create]: Plus,
  [ActionList.read]: Eye,
  [ActionList.list]: Eye,
  [ActionList.update]: Edit,
  [ActionList.delete]: Trash,
} as const

export function ListResourceViewButton(props: Omit<ResourceButtonProps, "action">) {
  return (
    <ButtonGroup>
      <ResourceViewButton action={ActionList.read} {...props} />
      <ResourceViewButton action={ActionList.update} {...props} />
      <ResourceViewButton action={ActionList.delete} {...props} />
    </ButtonGroup>
  )
}

export default function ResourceViewButton({
  action,
  data,
  resource: resource,
  label,
  id,
  children,
  defaultData,
}: ResourceButtonProps) {
  const router = useNavigate()
  const currentResourceContext = useCurrentViewResourceContext()
  const currentAction: ActionList = action ?? currentResourceContext.resourceAction

  const currentResource = resource ?? currentResourceContext.resource
  const view = currentResource?.views?.[currentAction] ?? currentResource.view

  const openIn =
    currentResource?.views?.[currentAction]?.behavior?.openIn ??
    view?.behavior?.openIn ??
    getResourceConfig()?.defaultResource?.views?.[currentAction]?.behavior?.openIn

  const isOpen = useBoolean()

  // Limits only apply to creation. `getLimit` may be synchronous
  // (comptage local) ou asynchrone (quota via API / abonnement). La limite
  // The resource's own limit wins; failing that, the one injected at runtime
  // through the context is used.
  const limitConfig =
    currentAction === ActionList.create
      ? (currentResource.limit ?? currentResourceContext?.limit)
      : undefined
  const { limit, isReached } = useLimit(limitConfig, currentResourceContext)

  const resourceId = currentResource["@id"]
  const currentId = id ?? (data ? getIdFromObject(data) : undefined)
  // Inherit defaultData from the context — typically set by a sub-resource's
  // onInitViewResource — so the created item is tied to its parent.
  const currentDefaultData = defaultData ?? currentResourceContext?.defaultData

  useEffect(() => {
    if (openIn !== "popup") return
    const sub = currentResource.onChange.subscribe(() => {
      isOpen.setFalse()
      currentResourceContext.fetchData()
    })
    return () => sub.unsubscribe()
  }, [currentResource, openIn])

  if (!permissionResource(currentResource, currentAction)) return null

  // The creation limit is reached: render the configured fallback, or simply
  // hide the button when there is none.
  if (isReached && limit) {
    const Fallback = limitConfig?.fallback
    return Fallback ? <Fallback limit={limit} /> : null
  }

  const link = generateLink({
    resourceId,
    resourceAction: currentAction,
    id: currentId,
    scope: currentResource.scope,
    defaultData:
      currentAction === ActionList.create ? currentDefaultData : undefined,
  })

  const Icon = ACTION_ICONS[currentAction]

  function onClick() {
    if (openIn === "window") router({ to: link })
    else isOpen.setTrue()
  }

  const getButtonLabel = () => {
    if (label) return label
    if (view?.label?.[currentAction]) {
      return view?.label?.[currentAction]
    }

    return currentAction
  }

  const buttonLabel = getButtonLabel()

  return (
    <>
      {children ? (
        <Link
          to={link}
          onClickCapture={(e) => {
            e.preventDefault()
            onClick()
          }}
        >
          {children}
        </Link>
      ) : (
        <Button
          size="lg"
          // `shrink` neutralise le `shrink-0` du Button : plusieurs boutons
          // side by side share the available width, instead of each claiming
          // 100% and overflowing their container.
          className="fc w-full min-w-0 shrink md:w-auto"
          variant="secondary"
          onClick={onClick}
        >
          {Icon && <Icon />}
          <Trans className="fc">{buttonLabel}</Trans>
        </Button>
      )}
      {openIn === "popup" && isOpen.value && (
        <Dialog
          open={isOpen.value}
          onOpenChange={(e) => {
            isOpen.setValue(e)
          }}
        >
          <DialogContent
            className="md:min-w-162.5"
            aria-describedby="modal"
            showCloseButton={true}
          >
            <ScrollArea className="max-h-[90vh]">
              {view?.description && (
                <DialogDescription>{view.description}</DialogDescription>
              )}
              <ViewResourceContextProvider
                resourceAction={currentAction}
                resource={currentResource}
                id={currentId}
                data={data}
                defaultData={
                  currentAction === ActionList.create
                    ? currentDefaultData
                    : undefined
                }
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
