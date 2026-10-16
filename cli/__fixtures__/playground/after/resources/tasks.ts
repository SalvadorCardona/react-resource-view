import { ListTodo } from "lucide-react"
import {
  DatePickerInputController,
  MultiSelectInputController,
  SelectInputController,
  TextAreaInputController,
} from "react-data-form"
import {
  createViewResource,
  layout,
  type BoardLayoutOptions,
} from "react-resource-view"
import { TaskRow } from "@/demo/playground/adminRows"
import {
  TASK_ASSIGNEES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TAGS,
  TASKS_ID,
  type Task,
} from "@/demo/playground/adminData"
import { FULL_WIDTH, NARROW, POPUP } from "@/demo/playground/shared"

/** The fields of a task, every one of them in the create and edit forms. */
const TASK_FIELDS = {
  title: { label: "Title", required: true },
  description: { label: "Description", controller: TextAreaInputController },
  status: {
    label: "Status",
    controller: SelectInputController,
    valueOptions: TASK_STATUSES,
  },
  priority: {
    label: "Priority",
    controller: SelectInputController,
    valueOptions: TASK_PRIORITIES,
  },
  assignee: {
    label: "Assignee",
    controller: SelectInputController,
    valueOptions: TASK_ASSIGNEES,
  },
  tags: {
    label: "Tags",
    controller: MultiSelectInputController,
    valueOptions: TASK_TAGS,
  },
  startDate: { label: "Starts on", controller: DatePickerInputController },
  dueDate: { label: "Due on", controller: DatePickerInputController },
}

/**
 * What the board does with a card besides showing it: a click opens the task
 * in a panel on the right — its `read` view, with a way to edit it, and a URL
 * of its own — and several cards can be selected (the checkbox, Ctrl/Cmd+click,
 * Shift+click, a long press on a phone) and moved together, by dragging one of
 * them or through "Move to…". "Mark as urgent" is a bulk action of the
 * playground's own, run on the selection.
 *
 * Spread rather than written out, like `FULL_WIDTH`, and typed as a mere
 * `object`: `openRecordIn` and `bulkActions` arrived in react-resource-view
 * 0.15, and an older release would refuse a `behavior` it knows none of the
 * keys of. Both keep the declaration compiling against whichever release the
 * site is installed on.
 */
const BOARD_BEHAVIOR: Partial<BoardLayoutOptions> = {
  bulkActions: [
    {
      label: "Mark as urgent",
      onAction: (tasks: Task[]) =>
        Promise.all(
          tasks.map((task) =>
            tasksResource.updateItem({
              "@id": task["@id"],
              id: task.id,
              priority: "urgent",
            })
          )
        ),
    },
  ],
}

/**
 * The team's work, and the resource that shows off `fullWidth`: a board of
 * four columns, a calendar and a timeline want the whole page, not the column
 * the other screens of the back office sit in.
 *
 * The option is set once on `view`, so every layout of the list is wide — and
 * taken back on the forms, which read better at the width of the others. That
 * is the granularity the option is for: per resource, then per action.
 */
export const tasksResource = createViewResource<Task>(TASKS_ID, {
  name: "Tasks",
  icon: ListTodo,
  storage: "local",
  ...FULL_WIDTH,
  description:
    "What the roastery team is working on, across the whole width of the page. Click a card to read the task, drag it to another column to move it on — or select several and move them together; the calendar and the timeline lay the same tasks out by due date.",
  form: { inputs: TASK_FIELDS },
  views: {
    list: {
      filters: {
        inputs: {
          title: { label: "Search a title" },
          assignee: {
            label: "Assignee",
            controller: SelectInputController,
            valueOptions: TASK_ASSIGNEES,
          },
          priority: {
            label: "Priority",
            controller: SelectInputController,
            valueOptions: TASK_PRIORITIES,
          },
        },
      },
      layouts: [
        // One column per status, and the list opens on it: dropping a card in
        // another column writes the new status back.
        layout.board({
          ...BOARD_BEHAVIOR,
          groupBy: "status",
          columns: TASK_STATUSES,
          components: { row: TaskRow },
        }),
        // A form of its own for the table, like the posts: a row edits what a
        // row can hold, and the description and the tags stay in the form.
        layout.table({
          fields: ["title", "status", "priority", "assignee", "dueDate"],
        }),
        layout.calendar({
          dateField: "dueDate",
          titleField: "title",
          colorField: "assignee",
        }),
        // Each task from the day it starts to the day it is due, one row per
        // person: who is carrying what, this fortnight.
        layout.timeline<Task>({
          startField: "startDate",
          endField: "dueDate",
          titleField: "title",
          groupBy: "assignee",
          groupsLabel: "Team",
          statusField: "status",
          showUnassigned: false,
          colorByStatus: {
            todo: "var(--color-primary)",
            in_progress: "var(--color-view)",
            in_review: "var(--color-form)",
            done: "var(--color-muted-foreground)",
          },
        }),
      ],
    },
    // A form is a column of fields: the whole width would only stretch them.
    create: { title: "New task", ...NARROW },
    read: { title: "Task", ...NARROW, open: "drawer" },
    update: { title: "Edit a task", ...NARROW },
    delete: { title: "Delete a task", ...POPUP },
  },
})
