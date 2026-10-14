/** The block builder of the playground, declared: the resources only pass it on. */
import type { FormInputInterface, FormInterface, ValueOptionInterface } from "react-data-form"

export declare const PAGE_BLOCK: string
export declare const EMAIL_BLOCK: string
export declare const BRAND_COLORS: ValueOptionInterface[]
export declare const BUILDER_FORM_COMPONENTS: FormInterface["components"]
export declare function createBlockBuilderInput(options: {
  label: string
  forms: string[]
  addLabel: string
}): FormInputInterface
