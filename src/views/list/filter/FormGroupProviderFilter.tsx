import { FormGroupProviderPropsInterface } from "react-data-form"
import { Field, FieldDescription, FieldLabel } from "@/ui/field"
import { Trans } from "react-mini-i18n"
import { FormInputViolation } from "react-data-form"

export default function FormGroupProviderFilter({
  formInput,
  onChange,
  formInputComponent: FormInputComponent,
}: FormGroupProviderPropsInterface) {
  const label = formInput.label ?? formInput["name"]
  const fieldName = formInput.name || formInput.id

  return (
    <Field className={"mb-2 mt-4"} data-field={fieldName || undefined}>
      {formInput.label !== null && (
        <FieldLabel htmlFor={formInput.id}>
          <Trans>{label}</Trans> {formInput.required ? "*" : ""}
        </FieldLabel>
      )}
      <FormInputComponent formInput={formInput} onChange={onChange} />
      {formInput?.description && (
        <FieldDescription>{formInput.description}</FieldDescription>
      )}
      <FormInputViolation formInput={formInput} />
    </Field>
  )
}
