import { Dialog, DialogContent, DialogDescription } from "@/ui/dialog"
import { ScrollArea } from "@/ui/scroll-area"
import { useNavigate } from "@/ports"
import { generateLink } from "@/routes/routes"
import { findResource } from "@/utils/findResource"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { cn } from "@/ui/cn"

export interface ChildViewResourceDialogProps {
  childViewResource: ViewResourceContextParams
}

/**
 * Renders a resource pointed at by the URL on top of the parent view:
 * .../{resourceId}/{action}/{id}/{childResourceId}/{childAction}/{childId}
 * Closing the dialog returns to the parent view's URL.
 */
export function ChildViewResourceDialog({
  childViewResource,
}: ChildViewResourceDialogProps) {
  const parentResource = useCurrentViewResourceContext()
  const navigate = useNavigate()

  const childResource = findResource(childViewResource)
  if (!childResource) {
    console.warn("ChildViewResourceDialog : resource enfant introuvable", {
      childViewResource,
    })
    return null
  }

  const childAction = childViewResource.resourceAction ?? ActionList.read
  const childView = childResource.views?.[childAction] ?? childResource.view

  const parentLink = generateLink({
    resource: parentResource.resource,
    resourceAction: parentResource.resourceAction,
    id: parentResource.id,
    scope: parentResource.scope,
    subResource: parentResource.subResource,
  })

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          navigate({ to: parentLink })
        }
      }}
    >
      <DialogContent
        aria-describedby="child-view-resource"
        showCloseButton={true}
        className={cn("md:min-w-162.5", childView?.className)}
      >
        <ScrollArea className="max-h-[90vh]">
          {childView?.description && (
            <DialogDescription>{childView.description}</DialogDescription>
          )}
          <ViewResourceContextProvider
            resource={childResource}
            resourceAction={childAction}
            id={childViewResource.id}
            defaultData={
              childAction === ActionList.create
                ? (childViewResource.defaultData ?? parentResource.defaultData)
                : undefined
            }
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
