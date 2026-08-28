import {
  ActionList,
  DatePickerInputController,
  NumberInputController,
  SelectInputController,
} from "react-data-form"
import {
  calendarViewOptionFactory,
  cardViewOptionFactory,
  columnViewOptionFactory,
  createViewResource,
  itemViewOptionFactory,
  splitViewFactory,
  tableViewOptionFactory,
  timelineViewOptionFactory,
} from "react-resource-view"
import { ArticleRow } from "@/demo/ArticleRow"
import {
  ARTICLE_CATEGORIES,
  ARTICLE_STATUSES,
  ARTICLES_ID,
  SESSIONS_ID,
  type Article,
  type Session,
} from "@/demo/data"

/**
 * The two resources every view demo on this site is built on.
 *
 * They are declared once, at module scope, because `createViewResource` writes
 * into the shared resource registry: declaring the same IRI twice from two
 * pages would register it twice. Each page then picks a `viewVariant` instead
 * of declaring a resource of its own.
 */

/** The form that drives both the create/edit views and the table's columns. */
const articleForm = {
  label: { title: "Article" },
  inputs: {
    title: { label: "Title", required: true },
    author: { label: "Author" },
    category: {
      label: "Category",
      controller: SelectInputController,
      valueOptions: ARTICLE_CATEGORIES,
    },
    status: {
      label: "Status",
      controller: SelectInputController,
      valueOptions: ARTICLE_STATUSES,
    },
    readingTime: { label: "Minutes", controller: NumberInputController },
    publishedAt: { label: "Published on", controller: DatePickerInputController },
  },
}

export const articlesResource = createViewResource<Article>(ARTICLES_ID, {
  name: "Articles",
  scope: "docs",
  // Permissions are opt-in: an undeclared one denies, and the button for it is
  // simply not rendered. The demos want the whole CRUD surface.
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Articles",
    // A list has no separate column description: the table renders one column
    // per field of this form, which is also the form the create and edit views
    // use. One description, four screens.
    form: articleForm,
    formFilter: {
      inputs: {
        title: { label: "Search a title" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: ARTICLE_STATUSES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory(),
      // The four layouts below draw a whole record rather than a row of cells,
      // so they take a row component instead of falling back to the raw dump.
      cardViewOptionFactory({ grid: 3, rowComponent: ArticleRow }),
      itemViewOptionFactory({ rowComponent: ArticleRow }),
      columnViewOptionFactory({
        rowComponent: ArticleRow,
        identifierKey: "status",
        identifierKeyList: ARTICLE_STATUSES,
      }),
      splitViewFactory({ rowComponent: ArticleRow, redirectReadToList: true }),
    ],
  },
  views: {
    [ActionList.list]: { name: "Articles" },
    [ActionList.create]: { name: "New article" },
  },
})

const sessionForm = {
  label: { title: "Session" },
  inputs: {
    title: { label: "Title", required: true },
    speaker: { label: "Speaker" },
    room: { label: "Room" },
    track: { label: "Track" },
    startAt: { label: "Starts at" },
    endAt: { label: "Ends at" },
  },
}

export const sessionsResource = createViewResource<Session>(SESSIONS_ID, {
  name: "Sessions",
  scope: "docs",
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Sessions",
    form: sessionForm,
    viewVariants: [
      calendarViewOptionFactory({
        name: "calendar",
        mode: "week",
        dateKey: "startAt",
        endDateKey: "endAt",
        titleKey: "title",
        colorKey: "track",
        hourStart: 8,
        hourEnd: 18,
      }),
      timelineViewOptionFactory<Session>({
        name: "timeline",
        startDateKey: "startAt",
        endDateKey: "endAt",
        titleKey: "title",
        groupKey: "room",
        groupsLabel: "Rooms",
        statusKey: "status",
        daysToShow: 5,
        showUnassigned: false,
        colorByStatus: {
          confirmed: "var(--color-view)",
          hold: "var(--color-form)",
        },
      }),
      tableViewOptionFactory(),
    ],
  },
})
