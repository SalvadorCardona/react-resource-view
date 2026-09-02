import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { AlertDialogCancel } from "@/ui/alert-dialog"
import { Trans, translate } from "react-mini-i18n"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { IdAbleInterface } from "jsonld-item"
import { CardContent, CardDescription, CardHeader } from "@/ui/card"

export default function RemoveViewComponent() {
  const currentResourceContext = useCurrentViewResourceContext()

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
            try {
              await currentResourceContext.resource.removeItem(
                currentResourceContext.data as IdAbleInterface
              )
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
