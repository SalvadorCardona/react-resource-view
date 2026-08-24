import { FormInterface } from "react-data-form"
import { ViewUpdateInterface } from "@/ViewInterface"
import { getFormConfig } from "react-data-form"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"

export default function getFormByCurrentResourceContext(
  currentResource: ViewResourceContextParams
): FormInterface | undefined {
  const action = currentResource.resourceAction as ActionList
  const resource = currentResource.resource

  if (!action || !resource) {
    throw new Error(
      "Action or Resource is not present in resource : " + resource?.["@id"]
    )
  }

  const views = resource?.views?.[action] as ViewUpdateInterface<any> | undefined

  if (!views) {
    throw new Error(
      "Views is not found  : " + resource?.["@id"] + " & action : " + action
    )
  }

  const form = views.form

  return form ?? { ...getFormConfig().defaultForm }
}
