import { Activity, FileUser, ScrollText, Users } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  EmailInputController,
  SelectInputController,
} from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
} from "react-resource-view"
import { UserRow } from "@/demo/playground/adminRows"
import {
  POSTS_ID,
  USER_ROLES,
  USER_STATUSES,
  USERS_ID,
  type User,
} from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/shared"
import { UserActivity } from "@/demo/playground/UserActivity"
import { UserResume } from "@/demo/playground/UserResume"

/**
 * The people who can sign in. This file is the whole screen: the table and its
 * columns, the card grid, the filter bar, the create dialog, the account page
 * with the posts written under it and the CV it amounts to, and the delete
 * confirmation all come out of the declaration below.
 */
export const usersResource = createViewResource<User>(USERS_ID, {
  name: "Users",
  scope: "admin",
  // Read by `createItemMenuWithResource`, so the sidebar `AdminLayout` draws is
  // built from the resources themselves rather than written a second time.
  icon: Users,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Users",
    description: "Everyone who can sign in to the back office.",
    // One description drives three screens: the table's columns, the create
    // form and the edit form.
    form: {
      inputs: {
        name: { label: "Name", required: true },
        email: {
          label: "E-mail",
          required: true,
          controller: EmailInputController,
        },
        // The account the person signs in for, left empty for the roastery's
        // own staff. It is a field of the form rather than a hidden column
        // because a sub-view's `defaultData` fills in the form: creating a user
        // from a company's page shows the company it will belong to.
        company: { label: "Company" },
        role: {
          label: "Role",
          controller: SelectInputController,
          valueOptions: USER_ROLES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: USER_STATUSES,
        },
        signedUpAt: { label: "Joined on", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        name: { label: "Search a name" },
        company: { label: "Company" },
        role: {
          label: "Role",
          controller: SelectInputController,
          valueOptions: USER_ROLES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: USER_STATUSES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory({ name: "Table" }),
      cardViewOptionFactory({ name: "Cards", grid: 3, rowComponent: UserRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New user", ...POPUP },
    // One of the forms opening on a page rather than over the list — a company
    // is the other: an account is more than its five fields, and the
    // collections belonging to it are laid out underneath, as tabs.
    [ActionList.update]: {
      name: "Edit a user",
      subViewResource: {
        list: [
          {
            slug: "posts",
            name: "Posts",
            icon: ScrollText,
            description: "Everything published under this name.",
            resourceId: POSTS_ID,
            resourceAction: ActionList.list,
            // The nested list is filtered by the account on screen, and its
            // create button writes the same author — a post started from here
            // belongs to this person rather than to nobody.
            onInitViewResource: (view, parent) => {
              const author = (parent?.data as User | undefined)?.name

              return {
                ...view,
                filter: { author },
                defaultData: { author },
              }
            },
          },
          {
            // The CV of this person — one account, one CV, so it is a field of
            // the user and not a collection beside it. A tab with a component
            // of its own rather than a nested resource: `UserResume` mounts the
            // page builder on the account being edited, and writes the blocks
            // back through this very resource.
            slug: "cv",
            name: "Curriculum vitæ",
            icon: FileUser,
            description: "What this account amounts to on paper, block by block.",
            viewComponent: UserResume,
          },
          {
            // A tab with no resource behind it: a component of one's own.
            slug: "activity",
            name: "Activity",
            icon: Activity,
            description: "What this account adds up to.",
            viewComponent: UserActivity,
          },
        ],
      },
    },
    [ActionList.delete]: { name: "Delete a user", ...POPUP },
  },
})
