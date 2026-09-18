import { FileUser } from "lucide-react"
import { ActionList, createFormArrayInputController } from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  itemViewOptionFactory,
} from "react-resource-view"
import { RESUME_BLOCK } from "@/demo/builder/blocks"
import { PROFILES_ID, type Profile } from "@/demo/playground/adminData"
import { DocumentRow } from "@/demo/playground/rows"
import { DRAWER, POPUP } from "@/demo/playground/shared"

/**
 * The CVs assembled with the page builder's résumé kit.
 *
 * A resource with no entry in the menu: a CV belongs to the account it was
 * written for, so it is reached through the "Curriculum vitæ" tab of a user —
 * see `usersResource`, which filters this list on `owner` and fills the same
 * field in when the tab's create button is pressed. Declaring it is still what
 * gives it its forms, its layouts and its URLs.
 *
 * Like the rest of the playground it declares no `path`, so it falls back to a
 * localStorage repository, seeded with a few versions of the same CV. A record
 * lands here through `createItem`, whether that call comes from this
 * resource's own form or from `/playground/builder` exporting a CV built with
 * the same block palette.
 */
export const profilesResource = createViewResource<Profile>(PROFILES_ID, {
  name: "Profiles",
  scope: "admin",
  icon: FileUser,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Curriculum vitæ",
    description:
      "CVs assembled from the page builder's résumé kit — built here or in the builder, both write to the same storage.",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        // The account the CV hangs under. A name rather than an IRI, like the
        // company of a user: it is what the tab filters on, and what the tab
        // writes back when the CV is created from there.
        owner: { label: "Owner" },
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
        owner: { label: "Owner" },
      },
    },
    viewVariants: [
      itemViewOptionFactory({ name: "List", rowComponent: DocumentRow }),
      cardViewOptionFactory({ name: "Cards", grid: 2, rowComponent: DocumentRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New CV", ...DRAWER },
    [ActionList.update]: { name: "Edit a CV", ...DRAWER },
    [ActionList.delete]: { name: "Delete a CV", ...POPUP },
  },
})
