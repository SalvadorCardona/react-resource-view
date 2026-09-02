import { useForm, FormContextOutput } from "react-data-form"
import { ApiJsonLdError } from "jsonld-api-client"
import { addErrorFromViolations } from "react-data-form"
import { normalizeApiError } from "@/api/apiRequestError"
import { resolveDialect } from "@/api/apiConfig"
import getFormByCurrentResourceContext from "@/views/update/getFormByCurrentResourceContext"
import { FormBuiltInterface, FormInterface } from "react-data-form"
import { ActionList } from "react-data-form"
import { toast } from "sonner"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { deepCopy } from "@/internal/object/deepCopy"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { generateLink } from "@/routes/routes"
import { useNavigate } from "@/ports"
import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { findResource } from "@/utils/findResource"
import { ViewResourceInterface } from "@/ViewResourceInterface"
import { translate } from "react-mini-i18n"

export interface formByResourceInputsInterface<DataProps extends object = object> {
  currentResource: ViewResourceContextParams
  onSubmit?: (data: DataProps) => DataProps
  onUpdated?: (data: DataProps) => void
  onChange?: (data: DataProps, form: FormInterface<DataProps>) => void
  data?: Partial<DataProps>
  form?: FormInterface
}

export default function useFormByResource<DataMain extends object = object>({
  currentResource,
  data,
  form,
  onSubmit,
  onChange,
  onUpdated,
}: formByResourceInputsInterface<DataMain>): FormContextOutput<DataMain> {
  const router = useNavigate()
  const id = currentResource?.id
  const action =
    currentResource.resourceAction ?? (id ? ActionList.update : ActionList.create)
  const view =
    currentResource.view ?? resolveViewResourceContext(currentResource).view
  const closeAfterUpdate = view?.behavior?.closeAfterUpdate ?? false
  const redirectToAfterUpdate = view?.behavior?.redirectToAfterUpdate ?? false

  const refreshDataAfterUpdate = view?.behavior?.refreshDataAfterUpdate ?? false
  /**
   * A form opening in a dialog has nowhere to send anyone.
   *
   * After a creation the form moves on to the new record's edit screen, so a
   * full-page "New user" does not sit there claiming to be empty. In a dialog
   * that same navigation leaves the page the dialog is drawn on: the list
   * underneath disappears, its filters and its page with it, and what the
   * user gets for filling in three fields is a screen they never asked for.
   * The dialog closes itself on the resource's `onChange` instead.
   */
  const opensInPopup = view?.behavior?.openIn === "popup"
  const resource = findResource({
    resourceId: currentResource.resourceId as string,
    resource: currentResource.resource,
  }) as ViewResourceInterface

  const currentForm = deepCopy(
    form ??
      (getFormByCurrentResourceContext({
        ...currentResource,
        resourceAction: currentResource.resourceAction ?? action,
      }) as FormBuiltInterface)
  )

  if (!currentForm) {
    throw Error("Form not found")
  }

  if (action === ActionList.read) {
    currentForm.action = ActionList.read
  }

  const formContext = useForm<DataMain>({
    form: currentForm,
    onChange,
    asyncData: async () => {
      const currentData = data ?? currentResource.data ?? undefined

      if (action === ActionList.create || data) return currentData as DataMain

      const fetcher = currentResource.resource?.getItem

      if (fetcher) {
        const response = await fetcher({
          id: id as string,
        })

        return response.data as DataMain
      }

      throw new Error("Data is unreachable")
    },
    onSubmit: async (data) => {
      const newData = onSubmit ? onSubmit(data) : data
      const newDataWithId = {
        ...{ id: id as string },
        ...newData,
      }

      const idInObjet = getIdFromObject(
        formContext.form.originalData,
        false,
        resource
      )
      if (idInObjet) {
        newDataWithId.id = idInObjet
      }

      try {
        const response =
          action === ActionList.create && !idInObjet
            ? await resource?.createItem(newDataWithId)
            : await resource?.updateItem(newDataWithId)
        toast.success(formContext.form?.label?.success, {
          description: translate("Your changes have been saved"),
        })

        if (typeof response === "undefined") {
          throw new Error("Data Unfetchable")
        }

        onUpdated?.(response.data as DataMain)

        if (refreshDataAfterUpdate) {
          formContext.updateData(response.data)
        }

        if (redirectToAfterUpdate) {
          router({
            to: redirectToAfterUpdate,
          })

          return response.data
        }

        if (action === ActionList.create && !closeAfterUpdate && !opensInPopup) {
          router({
            to: generateLink({
              id: getIdFromObject(response.data, false, resource) as string,
              resourceId: resource?.["@id"] as string,
              resourceAction: ActionList.update,
              // Without it the link is built in whatever scope is current
              // rather than the resource's own, and a back office creating a
              // record walks out of its own area.
              scope: resource?.scope,
            }),
          })

          return response.data
        }

        return response.data
      } catch (error) {
        // Whatever the backend called it — Hydra violations, a Strapi
        // `error.details.errors`, a PostgREST message — the dialect reads it
        // into the one shape the form knows how to show.
        const apiError = normalizeApiError(error, resolveDialect(resource))

        if (apiError) {
          // With no field violations — a 400 such as "slot no longer
          // available" — the API's detail is the only explanation to show.
          toast.error(formContext.form.label.error, {
            description: apiError.violations?.length
              ? undefined
              : (apiError.detail ?? undefined),
          })

          const formWithError = addErrorFromViolations(
            formContext.form as FormBuiltInterface,
            apiError as ApiJsonLdError
          )

          formContext.updateForm(formWithError)

          return data
        }

        // Not an API failure — a network outage, a bug. Nothing to pin on a
        // field, and nothing gained by dressing it up as a validation message.
        console.error(error)
      }

      return data
    },
  })

  return formContext
}
