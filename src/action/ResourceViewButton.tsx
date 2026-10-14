import { ReactNode, useEffect, useRef } from "react"
import { Button } from "@/ui/button"
import { generateLink } from "@/routes/routes"
import { ActionList } from "react-data-form"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { usePermission } from "@/utils/permissionResource"
import { Trans } from "react-mini-i18n"
import { Link, useNavigate } from "@/ports"
import { Edit, Eye, Plus, Trash } from "lucide-react"
import { useBoolean } from "@/internal/useBoolean"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer"
import { ScrollArea } from "@/ui/scroll-area"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { useQuota } from "@/hook/useQuota"
import type { Action } from "@/ResourceDefinition"
import { useMediaQuery } from "@/internal/browser/useMediaQuery"

export interface ResourceButtonProps extends ViewResourceContextParams {
  /** `"update"`, or `ActionList.update`. */
  action: Action
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
  const currentAction = (action ?? currentResourceContext.resourceAction) as ActionList

  const currentResource = resource ?? currentResourceContext.resource
  const view = currentResource?.views?.[currentAction]
  const open = view?.open ?? "page"

  // A dialog and a drawer are the same decision — the view is drawn over the
  // page instead of replacing it — so everything but the frame is shared.
  const opensOverThePage = open === "dialog" || open === "drawer"
  // Whether a save in the overlay closes it: what `afterSave` says, closing
  // being what a form drawn over the page does unless told otherwise.
  const closesOnSave = !view?.afterSave || view.afterSave === "close"

  const isOpen = useBoolean()
  // A drawer comes in from the side where there is room for it: the right of a
  // desktop, the bottom of a phone. `md` is the breakpoint the rest of the
  // package sizes against.
  const isWideScreen = useMediaQuery("(min-width: 768px)")

  // A quota only applies to creation. Its `get` may count synchronously — the
  // rows already loaded — or ask the API. The resource's own quota wins;
  // failing that, the one injected at runtime through the context is used.
  const quotaConfig =
    currentAction === ActionList.create
      ? (currentResource.quota ?? currentResourceContext?.quota)
      : undefined
  const { quota, isReached } = useQuota(quotaConfig, currentResourceContext)

  const resourceId = currentResource["@id"]
  const currentId = id ?? (data ? getIdFromObject(data) : undefined)
  // Inherit defaultData from the context — typically set by a sub-resource's
  // onInitViewResource — so the created item is tied to its parent.
  const currentDefaultData = defaultData ?? currentResourceContext?.defaultData

  // Read when the record is saved, not when the button mounted: the list's
  // `fetchData` closes over its filter, which may have changed since.
  const fetchDataRef = useRef(currentResourceContext.fetchData)
  fetchDataRef.current = currentResourceContext.fetchData

  useEffect(() => {
    if (!opensOverThePage) return
    const sub = currentResource.onChange.subscribe(() => {
      if (closesOnSave) isOpen.setFalse()
      fetchDataRef.current()
    })
    return () => sub.unsubscribe()
  }, [currentResource, opensOverThePage, closesOnSave])

  // Asked about the record the button acts on, when there is one.
  const isAllowed = usePermission(
    currentAction,
    currentAction === ActionList.create ? undefined : data,
    currentResource
  )

  if (!isAllowed) return null

  // The quota is reached: render the configured fallback, or simply hide the
  // button when there is none.
  if (isReached && quota) {
    const Fallback = quotaConfig?.fallback
    return Fallback ? <Fallback quota={quota} /> : null
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
    if (open === "page") router({ to: link })
    else isOpen.setTrue()
  }

  const getButtonLabel = () => {
    if (label) return label

    return view?.buttonLabel ?? currentAction
  }

  const buttonLabel = getButtonLabel()

  /* A dialog needs a name — assistive technology announces it, and a form
     opening over a list has to say which record it is about. The view's own
     `title` is that name; its `description` is not, because every action
     inherits the one written for the list and would introduce an edit form
     with the sentence that introduces the table. */
  const overlayTitle = <Trans>{view?.title ?? currentAction}</Trans>

  const overlayView = (
    <ViewResourceContextProvider
      resourceAction={currentAction}
      resource={currentResource}
      id={currentId}
      data={data}
      defaultData={
        currentAction === ActionList.create ? currentDefaultData : undefined
      }
    />
  )

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
      {open === "dialog" && isOpen.value && (
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
            <DialogHeader>
              <DialogTitle>{overlayTitle}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[90vh]">{overlayView}</ScrollArea>
          </DialogContent>
        </Dialog>
      )}
      {open === "drawer" && isOpen.value && (
        <Drawer
          open={isOpen.value}
          onOpenChange={(e) => {
            isOpen.setValue(e)
          }}
          // The direction the panel travels in is also the direction it is
          // swiped away in, so one prop settles both.
          swipeDirection={isWideScreen ? "right" : "down"}
          showSwipeHandle
        >
          <DrawerContent
            // Given a height of its own rather than the content's, the panel
            // does not resize itself as fields appear, and the form below
            // scrolls inside it instead of pushing it around.
            className="data-[swipe-axis=y]:[--drawer-height:85dvh] md:[--drawer-content-width:40rem]"
          >
            <DrawerHeader>
              <DrawerTitle>{overlayTitle}</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="min-h-0 flex-1" viewportClassName="px-4 pb-4">
              {overlayView}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
