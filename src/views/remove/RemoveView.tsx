import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { AlertDialogCancel } from "@/ui/alert-dialog"
import { Trans, translate } from "react-mini-i18n"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { IdAbleInterface } from "jsonld-item"
import { CardContent, CardDescription, CardHeader } from "@/ui/card"
import { isOptimistic, removeRecord } from "@/hook/useResourceMutation"
import { useOverlay } from "@/action/overlayContext"

export default function RemoveViewComponent() {
  const currentResourceContext = useCurrentViewResourceContext()
  const overlay = useOverlay()

  if (!currentResourceContext.data) return null

  return (
    <CardContent>
      {/* No title of its own: the view is already named by whatever frames
          it — the dialog it opens in, or the heading an application draws
          above a screen — and a second "Delete?" under "Delete a user" says
          the same thing twice. What is left is the one thing the name does
          not carry: that there is no way back. */}
      <CardHeader>
        <CardDescription>
          <Trans>This cannot be undone.</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent className={"flex gap-5 mt-5"}>
        <AlertDialogCancel>
          <Trans>Cancel</Trans>
        </AlertDialogCancel>
        <Button
          onClick={async () => {
            const { resource } = currentResourceContext
            const removal = removeRecord(
              resource,
              currentResourceContext.data as IdAbleInterface,
              {
                context: {
                  viewResourceContext: currentResourceContext.viewResource,
                },
              }
            )
            // The row is already gone from the list: the confirmation has
            // nothing left to ask. If the API refuses, the row comes back and
            // the toast says why.
            const optimistic = isOptimistic(resource, "delete")
            if (optimistic) overlay?.close()
            try {
              await removal
              // Waited for: the frame goes once the API has said yes.
              if (!optimistic) overlay?.close()
              toast.success(translate("Deleted"), {
                description: translate("The item has been removed"),
              })
            } catch {
              toast.error(translate("The item could not be removed"))
            }
          }}
        >
          <Trans>Continue</Trans>
        </Button>
      </CardContent>
    </CardContent>
  )
}
