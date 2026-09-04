import { MessageSquare } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  SelectInputController,
  TextAreaInputController,
} from "react-data-form"
import {
  createViewResource,
  itemViewOptionFactory,
  splitViewFactory,
  tableViewOptionFactory,
} from "react-resource-view"
import {
  COMMENT_STATUSES,
  COMMENTS_ID,
  type Comment,
} from "@/demo/playground/adminData"
import { CommentRow } from "@/demo/playground/adminRows"
import { POPUP } from "@/demo/playground/resources/shared"

/**
 * Moderation. A comment is written by a visitor, never by the back office:
 * leaving `canCreate` out is what removes the button, no condition to write
 * anywhere.
 */
export const commentsResource = createViewResource<Comment>(COMMENTS_ID, {
  name: "Comments",
  scope: "admin",
  icon: MessageSquare,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Comments",
    description: "What readers left under the posts, waiting for a decision.",
    // The filter the overview links to: "N comments awaiting moderation" opens
    // this list with `status=pending` already in the URL and in the form.
    form: {
      inputs: {
        author: { label: "Author", required: true },
        post: { label: "Post" },
        message: { label: "Message", controller: TextAreaInputController },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMMENT_STATUSES,
        },
        createdAt: { label: "Left on", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMMENT_STATUSES,
        },
      },
    },
    viewVariants: [
      // Moderation reads whole comments rather than columns of cells, so the
      // list of records comes before the table.
      itemViewOptionFactory({ name: "List", rowComponent: CommentRow }),
      // An inbox: the queue on the left, the comment being decided on the
      // right, and the next one a click away.
      splitViewFactory({
        name: "Split",
        rowComponent: CommentRow,
        redirectReadToList: true,
      }),
      tableViewOptionFactory({ name: "Table" }),
    ],
  },
  views: {
    [ActionList.update]: { name: "Moderate a comment", ...POPUP },
    [ActionList.delete]: { name: "Delete a comment", ...POPUP },
  },
})
