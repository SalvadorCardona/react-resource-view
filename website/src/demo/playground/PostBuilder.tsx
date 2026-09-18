import { useEffect, useState } from "react"
import { FormElement } from "react-data-form"
import { useCurrentViewResourceContext, useFormByResource } from "react-resource-view"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { BuilderCanvas } from "@/demo/builder/BuilderCanvas"
import { BuilderShell } from "@/demo/builder/BuilderShell"
import { PagePreview } from "@/demo/builder/PagePreview"
import type { Post } from "@/demo/playground/adminData"

/**
 * Editing a post, on the post itself.
 *
 * The back office had a page builder and a preview, and they were two screens:
 * the preview lived at `/playground/builder`, on sample data, while a real
 * article was written in a one-column form with nothing to look at. So the
 * editor is the builder now — same blocks, same palette, the record's own
 * repository underneath.
 *
 * `viewComponent` is the seam: a view may hand its rendering to a component of
 * the application, and `useFormByResource` gives that component the very form
 * the declaration describes, saving where a form of this resource saves. The
 * sub-views — the comments of the post — go on being drawn underneath by the
 * package, which is why nothing about them is written here.
 */
export function PostBuilder() {
  const currentResource = useCurrentViewResourceContext()
  const post = currentResource.data as Post | undefined
  const [blocks, setBlocks] = useState<BuilderBlock[]>(post?.blocks ?? [])

  const formContext = useFormByResource<Post>({
    currentResource,
    // Every keystroke hands back the whole payload; the preview is a function
    // of the blocks it holds rather than something wired to the form.
    onChange: (_, form) => setBlocks((form.data?.blocks as BuilderBlock[]) ?? []),
  })

  // The record arrives after the form is built — the view fetches it in
  // parallel — so the form is told about it, exactly as `EditView` does.
  useEffect(() => {
    if (!formContext.ready) return
    if (!currentResource.data) return
    formContext.updateData(currentResource.data as Post, true)
  }, [currentResource.data])

  return (
    <BuilderShell
      eyebrow={post?.category || "Post"}
      title={post?.title || "Untitled post"}
      description="The blocks on the left are the post; the page on the right is what it publishes as."
      outline={<FormElement {...formContext} key={formContext.form?.id ?? "post"} />}
      canvas={
        <BuilderCanvas
          blocks={blocks}
          preview={PagePreview}
          toolbarEnd={
            <span className="text-xs text-muted-foreground">
              {blocks.length} block{blocks.length === 1 ? "" : "s"}
            </span>
          }
        />
      }
    />
  )
}
