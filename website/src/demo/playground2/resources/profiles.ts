import { FileUser } from "lucide-react"
import { ActionList, createFormArrayInputController } from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  itemViewOptionFactory,
} from "react-resource-view"
import { RESUME_BLOCK, type BuilderBlock } from "@/demo/builder/blocks"
import { PROFILES_ID } from "@/demo/playground2/data"
import { DocumentRow } from "@/demo/playground2/rows"
import { DRAWER, POPUP } from "@/demo/playground2/shared"

export interface BuilderProfile {
  "@id": string
  "@type": string
  id: string
  title: string
  blocks: BuilderBlock[]
  updatedAt: string
}

/**
 * The CVs assembled with the page builder's résumé kit.
 *
 * Same storage story as `cmsResource`: no `path`, a localStorage repository
 * seeded with a few versions of the same CV, and a record written either from
 * this resource's own form or from the builder.
 */
export const profilesResource = createViewResource<BuilderProfile>(PROFILES_ID, {
  name: "My profiles",
  scope: "playground2",
  icon: FileUser,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "My profiles",
    description:
      "CVs assembled from the page builder's résumé kit — built here or in the builder, both write to the same storage.",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        blocks: createFormArrayInputController({
          label: "Sections",
          forms: [RESUME_BLOCK],
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
    [ActionList.create]: { name: "New profile", ...DRAWER },
    [ActionList.update]: { name: "Edit a profile", ...DRAWER },
    [ActionList.delete]: { name: "Delete a profile", ...POPUP },
  },
})
