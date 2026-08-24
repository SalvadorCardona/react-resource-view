import { TableCell, TableRow } from "@/ui/table"
import { RowComponentPropsInterface } from "@/ViewInterface"
import { Trans } from "react-mini-i18n"
import { getFormInputsFromForm } from "react-data-form"
import getIdFromObject from "@/internal/id/getIdFromObject"
import useFormByResource from "@/hook/useFormByResource"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { FormContext } from "react-data-form"
import { ActionList } from "react-data-form"
import { getIdFromIri } from "jsonld-item"
import { JsonLDItem } from "jsonld-item"
import { ListResourceViewButton } from "@/action/ResourceViewButton"
import { FormInterface } from "react-data-form"
import { FormGroupProviderPropsInterface } from "react-data-form"
import ItemRender from "@/views/list/ItemRender"
import { FormInputViolation } from "react-data-form"

import { DefaultItemComponent } from "@/views/list/component/DefaultItemComponent"

function ListFormGroupProvider({
  formInput,
  onChange,
  formInputComponent,
}: FormGroupProviderPropsInterface) {
  const InputControllerComponent = formInputComponent

  if (!formInput.controller) {
    return ItemRender(formInput.value)
  }

  return (
    <>
      <InputControllerComponent formInput={formInput} onChange={onChange} />
      <FormInputViolation formInput={formInput} />
    </>
  )
}

export function RowTable({ row }: RowComponentPropsInterface) {
  const currentResource = useCurrentViewResourceContext()
  const listViewContext = useListViewContext()

  const uri = getIdFromObject(row?.data)
  const id = getIdFromIri(uri ?? "")

  const currentForm: FormInterface = {
    components: {
      formGroupProvider: ListFormGroupProvider,
    },
    saveOnChange: true,
    ...currentResource.view.form,
  }

  const formContext = useFormByResource({
    currentResource: {
      ...currentResource,
      id,
      resourceAction: ActionList.update,
    },
    form: currentForm,
    data: row?.data,
    onUpdated: (data: JsonLDItem<any>) => {
      listViewContext.updateData(data, false)
    },
  })

  if (!row) return <Trans>No data yet</Trans>

  return (
    <FormContext key={"row-" + id} value={formContext}>
      <TableRow
        className={currentResource.isSelected(row.data) ? "bg-primary/10" : ""}
      >
        {getFormInputsFromForm(formContext.form)
          .filter((formInput) => !formInput.generatedValue)
          .map((formInput, e) => (
            <DefaultItemComponent
              formInput={formInput}
              key={"item-cell" + e + formInput.id + formContext.form.version}
            />
          ))}
        <TableCell className={"flex gap-2"}>
          <ListResourceViewButton data={row.data} />
        </TableCell>
      </TableRow>
    </FormContext>
  )
}
