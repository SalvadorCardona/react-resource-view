import { useEffect, useState } from "react"
import { FormElement, type FormInterface } from "react-data-form"
import { useCurrentViewResourceContext, useFormByResource } from "react-resource-view"
import { RESUME_BLOCK, type BuilderBlock } from "@/demo/builder/blocks"
import { createBlockBuilderInput } from "@/demo/builder/BlockBuilderInput"
import { BuilderCanvas } from "@/demo/builder/BuilderCanvas"
import { BUILDER_FORM_COMPONENTS } from "@/demo/builder/BuilderForm"
import { BuilderShell } from "@/demo/builder/BuilderShell"
import { ResumePreview } from "@/demo/builder/ResumePreview"
import type { User } from "@/demo/playground/adminData"

/**
 * The CV of an account — one account, one CV.
 *
 * It used to be a collection of its own, filtered on the *name* of the user:
 * somebody could have none, or twelve, the link broke the day they were
 * renamed, and each of them was edited in a 380-pixel drawer. A CV is not a
 * record somebody goes looking for, it is what an account amounts to on paper,
 * so `blocks` is a field of the user and this tab is where it is built.
 *
 * The tab is a `viewComponent`, which is rendered inside the record's own
 * view — `useCurrentViewResourceContext` therefore hands back the user being
 * edited, and `useFormByResource` writes through the users repository. The form
 * below holds that one field, so what is submitted is `{ id, blocks }`: the
 * other fields of the account are not this screen's business.
 */
const CV_FORM: FormInterface = {
  label: { submit: "Save the CV", success: "CV saved" },
  components: BUILDER_FORM_COMPONENTS,
  inputs: {
    blocks: createBlockBuilderInput({
      label: "Sections",
      forms: [RESUME_BLOCK],
      addLabel: "Start this CV",
    }),
  },
}

export function UserResume() {
  const currentResource = useCurrentViewResourceContext()
  const user = currentResource.data as User | undefined
  const [blocks, setBlocks] = useState<BuilderBlock[]>(user?.blocks ?? [])

  const formContext = useFormByResource<User>({
    currentResource,
    form: CV_FORM,
    onChange: (_, form) => setBlocks((form.data?.blocks as BuilderBlock[]) ?? []),
  })

  useEffect(() => {
    if (!formContext.ready) return
    if (!currentResource.data) return
    formContext.updateData(currentResource.data as User, true)
  }, [currentResource.data])

  return (
    <BuilderShell
      eyebrow="Curriculum vitæ"
      title={user?.name || "This account"}
      description="One account, one CV, built section by section — the sheet on the right is what it prints as."
      outline={<FormElement {...formContext} key={formContext.form?.id ?? "cv"} />}
      canvas={
        <BuilderCanvas
          blocks={blocks}
          preview={ResumePreview}
          medium="sheet"
          toolbarEnd={
            <span className="text-xs text-muted-foreground">
              {blocks.length} section{blocks.length === 1 ? "" : "s"}
            </span>
          }
        />
      }
    />
  )
}
