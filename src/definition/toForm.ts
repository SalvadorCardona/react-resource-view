import { FormInputInterface, FormInterface } from "react-data-form"
import type { FormDefinition } from "@/ResourceDefinition"

/** A form `react-data-form` can draw: the inputs set to `false` removed. */
export function toForm(
  definition: FormDefinition | undefined,
  fields?: string[]
): FormInterface | undefined {
  if (!definition) return undefined
  const declared = (definition.inputs ?? {}) as Record<
    string,
    FormInputInterface | false | null
  >

  const kept = Object.entries(declared).filter(
    (entry): entry is [string, FormInputInterface] => Boolean(entry[1])
  )
  const inputs = fields
    ? fields
        .map((field) => kept.find(([key]) => key === field) ?? [field, {}])
        .map(([key, input]) => [key, input] as const)
    : kept

  return { ...definition, inputs: Object.fromEntries(inputs) } as FormInterface
}
