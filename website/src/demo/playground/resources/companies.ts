import { Building2, Users } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  SelectInputController,
} from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
} from "react-resource-view"
import { CompanyRow } from "@/demo/playground/adminRows"
import {
  COMPANIES_ID,
  COMPANY_STATUSES,
  USERS_ID,
  type Company,
} from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/shared"

/**
 * The accounts the roastery supplies: the cafés, hotels and offices its
 * wholesale side lives on.
 *
 * This is the resource to open to see what a sub-view is for. A company is five
 * fields and the people who sign in for it, and that collection makes no sense
 * anywhere but under the company itself. So the edit view keeps the page rather
 * than a dialog: the form first, the tab underneath.
 */
export const companiesResource = createViewResource<Company>(COMPANIES_ID, {
  name: "Companies",
  scope: "admin",
  icon: Building2,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Companies",
    description:
      "The accounts the roastery supplies. Open one: its team is laid out under the form.",
    form: {
      inputs: {
        name: { label: "Name", required: true },
        city: { label: "City" },
        siret: { label: "SIRET" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMPANY_STATUSES,
        },
        signedAt: { label: "Account opened", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        name: { label: "Search a company" },
        city: { label: "City" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMPANY_STATUSES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory({ name: "Table" }),
      cardViewOptionFactory({ name: "Cards", grid: 3, rowComponent: CompanyRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New company", ...POPUP },
    // On a page, not over the list: a dialog has room for the five fields and
    // none for what hangs off them. Each tab is a full view context of its own
    // — it fetches, filters, paginates and writes — and the open one is a
    // segment of the URL, so `/update/1/team` lands right back here.
    [ActionList.update]: {
      name: "Edit a company",
      subViewResource: {
        list: [
          {
            slug: "team",
            name: "Team",
            icon: Users,
            description: "The accounts that sign in for this company.",
            resourceId: USERS_ID,
            resourceAction: ActionList.list,
            // Filtering alone would give a list of this company's people whose
            // create button makes an account belonging to nobody: `defaultData`
            // is what makes "new user" mean "new user *here*".
            onInitViewResource: (view, parent) => {
              const company = (parent?.data as Company | undefined)?.name

              return {
                ...view,
                filter: { company },
                defaultData: { company },
              }
            },
          },
        ],
      },
    },
    [ActionList.delete]: { name: "Delete a company", ...POPUP },
  },
})
