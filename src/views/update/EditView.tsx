import { FormElement } from "react-data-form"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { cn } from "@/ui/cn"
import useFormByResource from "@/hook/useFormByResource"
import { useEffect } from "react"

export default function EditView() {
  const currentResource = useCurrentViewResourceContext()
  const formContext = useFormByResource({
    currentResource: currentResource,
    data: currentResource.defaultData,
  })

  useEffect(() => {
    if (!formContext.ready) return
    if (!currentResource.data) return
    formContext.updateData(currentResource.data, true)
  }, [currentResource.data])

  return (
    <div
      className={cn("pb-5 max-w-150", currentResource.view?.className)}
      role={"edit-view"}
    >
      <FormElement {...formContext} key={formContext.form?.id ?? "form-element"} />
    </div>
  )
}
