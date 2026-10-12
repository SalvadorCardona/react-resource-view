import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/split")({
  head: () => ({
    meta: [
      { title: "Split and columns — react-resource-view" },
      {
        name: "description",
        content:
          "Master-detail in one screen, and a board grouped by a key. Two layouts that change how a collection is worked with, not just how it looks.",
      },
    ],
  }),
  component: SplitAndColumns,
})

const SPLIT = `import { splitViewFactory } from "react-resource-view"
import { ActionList } from "react-data-form"

viewVariants: [
  splitViewFactory({
    // What the right-hand pane shows. \`update\` makes it an editor.
    resourceAction: ActionList.read,
    // Shown before anything is selected.
    emptySelected: () => <p>Pick an article on the left.</p>,
    // \`read/{id}\` redirects to \`list/{id}\`, so incoming links land here.
    redirectReadToList: true,
  }),
]`

const OPENING = `columnViewOptionFactory({
  identifierKey: "status",
  identifierKeyList: STATUSES,
  behavior: {
    // "drawer" | "popup" | "window". Unset, a card opens nothing.
    openRecordIn: "drawer",
  },
})`

const BULK = `columnViewOptionFactory({
  identifierKey: "status",
  identifierKeyList: STATUSES,
  behavior: {
    // On by default; false takes the checkboxes and the bar away.
    selectable: true,
    // Beside "Move to…", in the bar the selection brings up.
    bulkActions: [
      {
        label: "Mark as urgent",
        icon: Flame,
        onAction: (tasks) =>
          Promise.all(
            tasks.map((task) =>
              tasksResource.updateItem({ id: task.id, priority: "urgent" })
            )
          ),
      },
    ],
  },
})`

const COLUMNS = `import { columnViewOptionFactory } from "react-resource-view"

const STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Published", value: "published" },
]

viewVariants: [
  columnViewOptionFactory({
    // Which field decides the column…
    identifierKey: "status",
    // …and which columns exist, in which order.
    identifierKeyList: STATUSES,
  }),
]`

function SplitAndColumns() {
  return (
    <DocArticle
      toc={[
        { id: "split", title: "Split" },
        { id: "redirect", title: "Incoming links" },
        { id: "columns", title: "Columns" },
        { id: "dragging", title: "Moving a card" },
        { id: "opening", title: "Opening a card" },
        { id: "selecting", title: "Moving several cards" },
        { id: "choosing", title: "Which one, when" },
      ]}
    >
      <H2 id="split">Split</H2>

      <P>
        The list on the left, the selected record on the right. It replaces the
        separate detail page rather than complementing it — which is why the resource
        often has no <C>read</C> screen to maintain at all.
      </P>

      <CodeBlock>{SPLIT}</CodeBlock>

      <Demo label="Pick a row on the left" wide>
        <ResourceDemo resource={articlesResource} variant="split" />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "resourceAction",
            type: "ActionList",
            default: "read",
            description: (
              <>
                What the right pane renders. <C>update</C> turns it into an editor,
                which is what makes a split feel like a mail client.
              </>
            ),
          },
          {
            name: "emptySelected",
            type: "FC",
            description: "Rendered before anything is selected.",
          },
          {
            name: "redirectReadToList",
            type: "boolean",
            description: (
              <>
                Makes <C>read/{"{id}"}</C> redirect to <C>list/{"{id}"}</C>.
              </>
            ),
          },
        ]}
      />

      <H2 id="redirect">Incoming links</H2>

      <P>
        Links built elsewhere — a notification, an email, a share — point at the
        detail view. With no detail view to point at, they would land nowhere.
      </P>

      <Callout kind="tip" title="That is what redirectReadToList is for">
        <P>
          It turns <C>read/42</C> into <C>list/42</C>, so an existing link opens the
          split with that item selected. Set it whenever the split is the only detail
          your resource has.
        </P>
      </Callout>

      <H2 id="columns">Columns</H2>

      <P>
        A board: one column per value of a chosen field. It needs two things — which
        field groups the records, and which values are columns.
      </P>

      <CodeBlock>{COLUMNS}</CodeBlock>

      <Demo label="Grouped by status" wide>
        <ResourceDemo resource={articlesResource} variant="column" />
      </Demo>

      <Callout kind="warning" title="Both keys are required">
        <P>
          Without <C>identifierKey</C> the layout renders “Not Identifiant Found”,
          and without <C>identifierKeyList</C>, “no identifierKeyList”. The list is
          explicit on purpose: an empty column has to exist to be dropped into, and
          deriving the columns from the data would make it vanish.
        </P>
      </Callout>

      <P>
        <C>identifierKeyList</C> takes the same option shape as a select field, so
        the field's own <C>valueOptions</C> can be reused directly — one list, both
        places.
      </P>

      <H2 id="dragging">Moving a card</H2>

      <P>
        Dragging a card into another column writes the new value of{" "}
        <C>identifierKey</C> through the repository and refetches. There is no drag
        handler to write: moving a card <em>is</em> editing that field.
      </P>

      <H2 id="opening">Opening a card</H2>

      <P>
        <C>behavior.openRecordIn</C> makes the whole card clickable — with a pointer
        cursor, a hover state and a focus ring — and says what a click opens: the
        record's <C>read</C> view, with a way to edit it.
      </P>

      <CodeBlock>{OPENING}</CodeBlock>

      <Ul>
        <Li>
          <C>drawer</C> slides it in from the right — up from the bottom on a phone.
        </Li>
        <Li>
          <C>popup</C> centres it in a dialog.
        </Li>
        <Li>
          <C>window</C> goes to the record's own page, through <C>generateLink</C>{" "}
          and the configured router.
        </Li>
      </Ul>

      <P>
        A drawer or a popup is written into the URL as a child view of the list —{" "}
        <C>…/tasks/list/tasks/read/12</C> — so it can be shared, a reload reopens it,
        and the browser's Back button closes it. The host reads it back with{" "}
        <A href="/docs/resource-view/routing">
          <C>parseLink</C>
        </A>
        , as it does every other link. Escape, the close button or a click on the
        backdrop close it too; the focus stays inside while it is open, and goes back
        to the card afterwards. On the keyboard a card is reached with Tab and opened
        with Enter.
      </P>

      <Callout kind="tip" title="The controls of a card keep their click">
        <P>
          A button, a link, a menu, a checkbox or a drag handle drawn by your row
          component never opens the card: a click that lands on a control — or in
          anything with <C>data-card-control</C> — is the control's alone, with no{" "}
          <C>stopPropagation</C> to add. Selecting some of the card's text does not
          open it either.
        </P>
      </Callout>

      <H2 id="selecting">Moving several cards</H2>

      <P>
        Cards can be selected: the checkbox that shows on hover, Ctrl/Cmd+click to
        add or remove one, Shift+click for a range within a column, Space on a
        focused card — and a long press on a phone, after which a tap adds or
        removes. As soon as one card is selected, a bar comes up with the count,
        “Move to…”, the view's own <C>bulkActions</C> and “Deselect all”; Escape
        empties the selection too.
      </P>

      <P>
        Dragging a selected card carries the whole selection, under a “3 cards”
        preview. Either way, each record is updated through the repository and drawn
        in its new column straight away; a card whose update fails goes back to where
        it was, stays selected, and a message says how many could not be moved.
      </P>

      <CodeBlock>{BULK}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "behavior.openRecordIn",
            type: '"drawer" | "popup" | "window"',
            description: (
              <>
                What a click on a card opens. Needs <C>canRead</C>.
              </>
            ),
          },
          {
            name: "behavior.selectable",
            type: "boolean",
            default: "true",
            description: "Whether cards can be selected and moved together.",
          },
          {
            name: "behavior.bulkActions",
            type: "BulkActionInterface[]",
            description: (
              <>
                <C>{"{ label, icon?, onAction(records) }"}</C>, run on the selected
                records; the board refreshes once it settles.
              </>
            ),
          },
        ]}
      />

      <H2 id="choosing">Which one, when</H2>

      <Ul>
        <Li>
          <strong>Split</strong> when records are read one after another and the list
          is a navigation aid — an inbox, a queue, a log.
        </Li>
        <Li>
          <strong>Columns</strong> when the interesting operation is moving a record
          between states — a pipeline, a kanban, an editorial workflow.
        </Li>
        <Li>
          <strong>Neither</strong> when the reader is comparing records, in which
          case <A href="/docs/resource-view/table">a table</A> beats both.
        </Li>
      </Ul>
    </DocArticle>
  )
}
