import { FormInterface } from "react-data-form"
import { getFormConfig } from "react-data-form"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"

export default function getFormByCurrentResourceContext(
  currentResource: ViewResourceContextParams
): FormInterface | undefined {
  const action = currentResource.resourceAction as ActionList | undefined
  const resource = currentResource.resource

  if (!action || !resource) {
    throw new Error(
      "Action or Resource is not present in resource : " + resource?.["@id"]
    )
  }

  const views = resource?.views?.[action]

  if (!views) {
    throw new Error(
      "Views is not found  : " + resource?.["@id"] + " & action : " + action
    )
  }

  const form = views.form

  return form ?? { ...getFormConfig().defaultForm }
}
