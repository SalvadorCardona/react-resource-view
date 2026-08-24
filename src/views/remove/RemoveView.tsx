import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { AlertDialogCancel } from "@/ui/alert-dialog"
import { Trans, translate } from "react-mini-i18n"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { IdAbleInterface } from "jsonld-item"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card"

export default function RemoveViewComponent() {
  const currentResourceContext = useCurrentViewResourceContext()

  if (!currentResourceContext.data) return null

  return (
    <CardContent>
      <CardHeader>
        <CardTitle>Supprimer ?</CardTitle>
        <CardDescription>This cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent className={"flex gap-5 mt-5"}>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
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
              toast.error("Erreur lors de la suppression")
            }
          }}
        >
          <Trans>Continuer</Trans>
        </Button>
      </CardContent>
    </CardContent>
  )
}
