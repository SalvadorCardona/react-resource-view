import { Activity, ScrollText, Users } from "lucide-react"
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
import {
  POSTS_ID,
  USER_ROLES,
  USER_STATUSES,
  USERS_ID,
  type User,
} from "@/demo/playground/adminData"
import { UserRow } from "@/demo/playground/adminRows"
import { POPUP } from "@/demo/playground/resources/shared"
import { UserActivity } from "@/demo/playground/UserActivity"

/**
 * The people who can sign in. This file is the whole screen: the table and
 * its columns, the card grid, the filter bar, the create dialog, the account
 * page with the posts belonging to it and the delete confirmation all come out
 * of the declaration below.
 */
export const usersResource = createViewResource<User>(USERS_ID, {
  name: "Users",
  scope: "admin",
  // Read by `createItemMenuWithResource`, so the menu of the scope is built
  // from the resources themselves rather than written a second time.
  icon: Users,
  // What opens the list — `canRead` is the permission both the list and the
  // detail are checked against. The detail is never linked to: the row actions
  // of a list are edit and delete, and neither the menu nor the shell offers a
  // way in.
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
    // The one form of the administration opening on a page rather than over
    // the list: an account is more than its five fields — it is what the
    // person wrote — and the collections belonging to them are laid out
    // underneath, as tabs. A dialog has no room for that.
    [ActionList.update]: {
      name: "Edit a user",
      subViewResource: {
        // The tabs sit above the sub-view and scroll sideways when they run
        // past the screen — `orientation: "vertical"` puts them in a column
        // beside it instead.
        list: [
          {
            slug: "posts",
            name: "Posts",
            icon: ScrollText,
            description: "Everything published under this name.",
            resourceId: POSTS_ID,
            resourceAction: ActionList.list,
            // The nested list is filtered by the account on screen, and its
            // create button writes the same author — a post started from
            // here belongs to this person rather than to nobody.
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
