import { LayoutTemplate } from "lucide-react"
import { ActionList, createFormArrayInputController } from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  itemViewOptionFactory,
} from "react-resource-view"
import { PAGE_BLOCK, type BuilderBlock } from "@/demo/builder/blocks"
import { DocumentRow } from "@/demo/playground2/rows"
import { DRAWER, POPUP } from "@/demo/playground2/shared"

export const CMS_ID = "playground2_pages"

export interface BuilderPage {
  "@id": string
  "@type": string
  id: string
  title: string
  blocks: BuilderBlock[]
  updatedAt: string
}

/**
 * The pages assembled with the page builder's landing-page kit.
 *
 * No `path` is declared, so — like the rest of the playground — this falls
 * back to a localStorage repository, and it starts genuinely empty: nothing
 * seeds it. A page lands here through `createItem`, whether that call comes
 * from this resource's own "New page" form or from `/playground2/builder`
 * publishing a page built with the same block palette.
 */
export const cmsResource = createViewResource<BuilderPage>(CMS_ID, {
  name: "CMS",
  scope: "playground2",
  icon: LayoutTemplate,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "CMS",
    description:
      "Pages assembled from the page builder's landing-page kit — built here or in the builder, both write to the same storage.",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        blocks: createFormArrayInputController({
          label: "Content",
          forms: [PAGE_BLOCK],
          draggable: true,
          closedByDefault: true,
        }),
      },
    },
    formFilter: {
      inputs: {
        title: { label: "Search a title" },
      },
    },
    viewVariants: [
      itemViewOptionFactory({ name: "List", rowComponent: DocumentRow }),
      cardViewOptionFactory({ name: "Cards", grid: 2, rowComponent: DocumentRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New page", ...DRAWER },
    [ActionList.update]: { name: "Edit a page", ...DRAWER },
    [ActionList.delete]: { name: "Delete a page", ...POPUP },
  },
})
