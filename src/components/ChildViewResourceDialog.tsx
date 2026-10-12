import { useEffect, useState } from "react"
import { Trans } from "react-mini-i18n"
import { Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer"
import { ScrollArea } from "@/ui/scroll-area"
import { buttonVariants } from "@/ui/button"
import { Link, useNavigate } from "@/ports"
import { generateLink } from "@/routes/routes"
import { findResource } from "@/utils/findResource"
import { permissionResource } from "@/utils/permissionResource"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { useMediaQuery } from "@/internal/browser/useMediaQuery"
import {
  forgetChildViewOpener,
  hasChildViewMounted,
  readChildViewOpener,
  trackChildViewMounted,
} from "@/components/childViewOpener"
import { cn } from "@/ui/cn"

export interface ChildViewResourceDialogProps {
  childViewResource: ViewResourceContextParams
}

/**
 * Renders a resource pointed at by the URL on top of the parent view:
 * .../{resourceId}/{action}/{id}/{childResourceId}/{childAction}/{childId}
 * Closing the dialog returns to the parent view's URL.
 *
 * It is a centred dialog, or a panel sliding in from the right when the parent
 * view opens its records in a drawer (`behavior.openRecordIn`) or the child
 * view is itself declared as one (`behavior.openIn`).
 */
export function ChildViewResourceDialog({
  childViewResource,
}: ChildViewResourceDialogProps) {
  const parentResource = useCurrentViewResourceContext()
  const navigate = useNavigate()
  const isWideScreen = useMediaQuery("(min-width: 768px)")

  const childResource = findResource(childViewResource)

  // Whatever is saved in the child — the record edited in the drawer — is
  // what the view underneath shows, and it would otherwise stay stale.
  useEffect(() => {
    if (!childResource) return
    const sub = childResource.onChange.subscribe(() => parentResource.fetchData())
    return () => sub.unsubscribe()
  }, [childResource])

  const [opener] = useState(() =>
    readChildViewOpener(childResource?.["@id"] ?? "", childViewResource.id)
  )

  // However the dialog goes — its own close, the browser's Back — the focus
  // goes back to what opened it. Checked a moment later: a dialog dropped and
  // drawn again at once (React's strict mode, a host suspending on the way)
  // is not the dialog going.
  useEffect(() => {
    const untrack = trackChildViewMounted()
    return () => {
      untrack()
      setTimeout(() => {
        if (hasChildViewMounted()) return
        if (opener.element?.isConnected) opener.element.focus()
      })
    }
  }, [opener])

  if (!childResource) {
    console.warn("ChildViewResourceDialog : resource enfant introuvable", {
      childViewResource,
    })
    return null
  }

  const childAction = childViewResource.resourceAction ?? ActionList.read
  const childView = childResource.views?.[childAction] ?? childResource.view

  const inDrawer =
    parentResource.view?.behavior?.openRecordIn === "drawer" ||
    childView?.behavior?.openIn === "drawer"

  // The filter and the layout of the view underneath travel with every link
  // built from here: closing the dialog must not land on another list.
  const parentParams: ViewResourceContextParams = {
    resource: parentResource.resource,
    resourceAction: parentResource.resourceAction,
    id: parentResource.id,
    // The resource's own scope, as the card that opened the child wrote it.
    scope: parentResource.resource?.scope ?? parentResource.scope,
    subResource: parentResource.subResource,
    filter: parentResource.filter,
    viewVariantId: parentResource.viewVariant,
  }
  const parentLink = generateLink(parentParams)

  const editLink =
    childAction === ActionList.read &&
    childViewResource.id &&
    permissionResource(childResource, ActionList.update)
      ? generateLink({
          ...parentParams,
          childViewResource: {
            resource: childResource,
            resourceAction: ActionList.update,
            id: childViewResource.id,
          },
        })
      : undefined

  const close = () => {
    forgetChildViewOpener()
    if (opener.pushed && typeof window !== "undefined") {
      window.history.back()
    } else {
      navigate({ to: parentLink })
    }
  }

  const title = <Trans>{childView?.name ?? childAction}</Trans>

  const editButton = editLink && (
    <Link
      to={editLink}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        // Under the title, which a panel coming up from the bottom centres.
        "w-fit group-data-[swipe-axis=y]/drawer-popup:self-center md:self-start"
      )}
      // Replaced rather than pushed: the dialog is one entry of the history
      // whatever it shows, and Back still closes it.
      onClick={(e) => {
        e.preventDefault()
        navigate({ to: editLink, replace: true })
      }}
    >
      <Edit />
      <Trans className="fc">update</Trans>
    </Link>
  )

  const content = (
    <ViewResourceContextProvider
      key={childAction}
      resource={childResource}
      resourceAction={childAction}
      id={childViewResource.id}
      defaultData={
        childAction === ActionList.create
          ? (childViewResource.defaultData ?? parentResource.defaultData)
          : undefined
      }
    />
  )

  if (inDrawer) {
    return (
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) close()
        }}
        swipeDirection={isWideScreen ? "right" : "down"}
        showSwipeHandle
      >
        <DrawerContent className="data-[swipe-axis=y]:[--drawer-height:85dvh] md:[--drawer-content-width:40rem]">
          <DrawerHeader className="gap-3 pr-14">
            <DrawerTitle>{title}</DrawerTitle>
            {editButton}
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1" viewportClassName="px-4 pb-4">
            {content}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        aria-describedby="child-view-resource"
        showCloseButton={true}
        className={cn("md:min-w-162.5", childView?.className)}
      >
        <DialogHeader className="gap-3">
          <DialogTitle>{title}</DialogTitle>
          {editButton}
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          {childView?.description && (
            <DialogDescription>{childView.description}</DialogDescription>
          )}
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
