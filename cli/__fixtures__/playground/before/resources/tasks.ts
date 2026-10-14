import { ListTodo } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  MultiSelectInputController,
  SelectInputController,
  TextAreaInputController,
} from "react-data-form"
import {
  calendarViewOptionFactory,
  columnViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
  timelineViewOptionFactory,
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
const BOARD_BEHAVIOR: { behavior: object } = {
  behavior: {
    openRecordIn: "drawer",
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
  },
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
  scope: "admin",
  icon: ListTodo,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    ...FULL_WIDTH,
    name: "Tasks",
    description:
      "What the roastery team is working on, across the whole width of the page. Click a card to read the task, drag it to another column to move it on — or select several and move them together; the calendar and the timeline lay the same tasks out by due date.",
    form: { inputs: TASK_FIELDS },
    formFilter: {
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
    viewVariants: [
      // One column per status, and the list opens on it: dropping a card in
      // another column writes the new status back.
      columnViewOptionFactory({
        ...BOARD_BEHAVIOR,
        name: "Board",
        rowComponent: TaskRow,
        identifierKey: "status",
        identifierKeyList: TASK_STATUSES,
      }),
      // A form of its own for the table, like the posts: a row edits what a
      // row can hold, and the description and the tags stay in the form.
      tableViewOptionFactory({
        name: "Table",
        form: {
          inputs: {
            title: TASK_FIELDS.title,
            status: TASK_FIELDS.status,
            priority: TASK_FIELDS.priority,
            assignee: TASK_FIELDS.assignee,
            dueDate: TASK_FIELDS.dueDate,
          },
        },
      }),
      calendarViewOptionFactory({
        name: "Calendar",
        dateKey: "dueDate",
        titleKey: "title",
        colorKey: "assignee",
      }),
      // Each task from the day it starts to the day it is due, one row per
      // person: who is carrying what, this fortnight.
      timelineViewOptionFactory<Task>({
        name: "Timeline",
        startDateKey: "startDate",
        endDateKey: "dueDate",
        titleKey: "title",
        groupKey: "assignee",
        groupsLabel: "Team",
        statusKey: "status",
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
  views: {
    // A form is a column of fields: the whole width would only stretch them.
    [ActionList.create]: { name: "New task", ...NARROW },
    [ActionList.read]: { name: "Task", ...NARROW },
    [ActionList.update]: { name: "Edit a task", ...NARROW },
    [ActionList.delete]: { name: "Delete a task", ...POPUP },
  },
})
