import { MessageSquare } from "lucide-react"
import {
  DatePickerInputController,
  SelectInputController,
  TextAreaInputController,
} from "react-data-form"
import { createViewResource, layout } from "react-resource-view"
import { CommentRow } from "@/demo/playground/adminRows"
import {
  COMMENT_STATUSES,
  COMMENTS_ID,
  type Comment,
} from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/shared"

/**
 * Moderation. A comment is written by a visitor, never by the back office:
 * leaving `canCreate` out is what removes the button, no condition to write
 * anywhere.
 */
export const commentsResource = createViewResource<Comment>(COMMENTS_ID, {
  name: "Comments",
  icon: MessageSquare,
  storage: "local",
  permissions: { create: false },
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
  views: {
    list: {
      filters: {
        inputs: {
          status: {
            label: "Status",
            controller: SelectInputController,
            valueOptions: COMMENT_STATUSES,
          },
        },
      },
      layouts: [
        // Moderation reads whole comments rather than columns of cells, so the
        // list of records comes before the table.
        layout.items({ label: "List", components: { row: CommentRow } }),
        // An inbox: the queue on the left, the comment being decided on the
        // right, and the next one a click away.
        layout.split({ readInList: true, components: { row: CommentRow } }),
        layout.table(),
      ],
    },
    update: { title: "Moderate a comment", ...POPUP },
    delete: { title: "Delete a comment", ...POPUP },
  },
})
