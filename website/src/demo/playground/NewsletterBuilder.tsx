import { useEffect, useState } from "react"
import { FormElement } from "react-data-form"
import {
  useCurrentViewResourceContext,
  useFormByResource,
} from "react-resource-view"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { BuilderCanvas } from "@/demo/builder/BuilderCanvas"
import { BuilderShell } from "@/demo/builder/BuilderShell"
import { EmailPreview } from "@/demo/builder/EmailPreview"
import { useEmailOutputs } from "@/demo/builder/EmailOutputs"
import type { Newsletter } from "@/demo/playground/adminData"

/**
 * Editing a newsletter, on the newsletter itself — `PostBuilder`, for email.
 *
 * Same seam: `viewComponent` hands the edit view to this component, and
 * `useFormByResource` gives it the form the declaration describes, saving
 * through the resource's own repository. The envelope fields fold into the
 * "Settings" panel above the blocks; the canvas shows the HTML `renderEmail`
 * produces from both, in a mail-client frame, with its source, its text part
 * and its weight.
 */
export function NewsletterBuilder() {
  const currentResource = useCurrentViewResourceContext()
  const newsletter = currentResource.data as Newsletter | undefined
  const [email, setEmail] = useState(() => split(newsletter))

  const formContext = useFormByResource<Newsletter>({
    currentResource,
    onChange: (_, form) => setEmail(split(form.data as Newsletter | undefined)),
  })

  // The record arrives after the form is built, as in `PostBuilder`.
  useEffect(() => {
    if (!formContext.ready) return
    if (!currentResource.data) return
    formContext.updateData(currentResource.data as Newsletter, true)
    setEmail(split(currentResource.data as Newsletter))
  }, [currentResource.data])

  const outputs = useEmailOutputs(email.blocks, email.fields)

  return (
    <BuilderShell
      eyebrow="Newsletter"
      title={newsletter?.subject || "Untitled newsletter"}
      description="The blocks on the left are the message; on the right, the HTML a mailbox receives."
      actions={outputs.actions}
      outline={
        <FormElement {...formContext} key={formContext.form?.id ?? "newsletter"} />
      }
      canvas={
        <BuilderCanvas
          blocks={email.blocks}
          fields={email.fields}
          preview={EmailPreview}
          medium="email"
          sources={outputs.sources}
          payload={{ ...email.fields, blocks: email.blocks }}
          toolbarEnd={outputs.toolbarEnd}
        />
      }
    />
  )
}

function split(data?: Partial<Newsletter>) {
  const { blocks, ...fields } = data ?? {}
  return { blocks: (blocks as BuilderBlock[] | undefined) ?? [], fields }
}
