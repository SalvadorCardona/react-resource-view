import { ScrollText } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  NumberInputController,
  SelectInputController,
} from "react-data-form"
import {
  cardViewOptionFactory,
  columnViewOptionFactory,
  createViewResource,
  splitViewFactory,
  tableViewOptionFactory,
} from "react-resource-view"
import {
  POST_CATEGORIES,
  POST_STATUSES,
  POSTS_ID,
  type Post,
} from "@/demo/playground/adminData"
import { PostRow } from "@/demo/playground/adminRows"
import { POPUP } from "@/demo/playground/resources/shared"

/**
 * The blog. Four layouts over the same seven fields — and the board is the one
 * to try: drag a post from "Draft" to "Published" and the record is updated,
 * no code written for it here.
 */
export const postsResource = createViewResource<Post>(POSTS_ID, {
  name: "Posts",
  scope: "admin",
  icon: ScrollText,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Posts",
    description:
      "The blog, from the first draft to the day it goes out. Try the board: dragging a card moves the post to that status.",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        category: {
          label: "Category",
          controller: SelectInputController,
          valueOptions: POST_CATEGORIES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: POST_STATUSES,
        },
        publishedAt: {
          label: "Published on",
          controller: DatePickerInputController,
        },
        views: { label: "Views", controller: NumberInputController },
      },
    },
    formFilter: {
      inputs: {
        title: { label: "Search a title" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: POST_STATUSES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory({ name: "Table" }),
      // One column per status: the editorial pipeline, and a drop target that
      // writes the new status back through the same repository the table uses.
      columnViewOptionFactory({
        name: "Board",
        rowComponent: PostRow,
        identifierKey: "status",
        identifierKeyList: POST_STATUSES,
      }),
      cardViewOptionFactory({ name: "Cards", grid: 3, rowComponent: PostRow }),
      // The list on the left, the edit form on the right; a link to
      // `read/{id}` lands on the split with that post open.
      splitViewFactory({
        name: "Split",
        rowComponent: PostRow,
        redirectReadToList: true,
      }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New post", ...POPUP },
    [ActionList.update]: { name: "Edit a post", ...POPUP },
    [ActionList.delete]: { name: "Delete a post", ...POPUP },
  },
})
