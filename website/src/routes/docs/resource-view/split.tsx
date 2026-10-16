import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Term, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/split")({
  head: () => ({
    meta: [
      { title: "Split and board — react-resource-view" },
      {
        name: "description",
        content:
          "Master-detail in one screen, and a board grouped by a field. Two layouts that change how a collection is worked with, not just how it looks.",
      },
    ],
  }),
  component: SplitAndColumns,
})

const SPLIT = `import { layout } from "react-resource-view"

layouts: [
  layout.split({
    // What the right-hand pane shows. The default, \`update\`, makes it an editor.
    action: "read",
    // Shown before anything is selected.
    emptyState: () => <p>Pick an article on the left.</p>,
    // \`read/{id}\` lands on \`list/{id}\`, so incoming links land here.
    readInList: true,
  }),
]`

const OPENING = `views: {
  // "page" | "dialog" | "drawer". Unset, a card opens the record's page.
  read: { open: "drawer" },
  list: {
    layouts: [layout.board({ groupBy: "status", columns: STATUSES })],
  },
}`

const BULK = `views: {
  list: {
    // On by default on a board; false takes the checkboxes and the bar away.
    selectable: true,
    // Beside "Move to…", in the bar the selection brings up.
    bulkActions: [
      {
        label: "Mark as urgent",
        icon: Flame,
        onAction: (tasks, mutation) =>
          Promise.all(
            tasks.map((task) => mutation.update({ ...task, priority: "urgent" }))
          ),
      },
      "delete",
    ],
    layouts: [layout.board({ groupBy: "status", columns: STATUSES })],
  },
}`

const COLUMNS = `import { layout } from "react-resource-view"

const STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Published", value: "published" },
]

layouts: [
  layout.board({
    // Which field decides the column…
    groupBy: "status",
    // …and which columns exist, in which order.
    columns: STATUSES,
  }),
]`

function SplitAndColumns() {
  return (
    <DocArticle
      toc={[
        { id: "split", title: "Split" },
        { id: "redirect", title: "Incoming links" },
        { id: "columns", title: "Board" },
        { id: "dragging", title: "Moving a card" },
        { id: "opening", title: "Opening a card" },
        { id: "selecting", title: "Moving several cards" },
        { id: "choosing", title: "Which one, when" },
      ]}
    >
      <H2 id="split">Split</H2>

      <P>
        The list on the left, the selected record on the right. It replaces the
        separate detail page rather than complementing it — which is why the{" "}
        <Term id="resource">resource</Term> often has no <C>read</C> screen to
        maintain at all.
      </P>

      <CodeBlock>{SPLIT}</CodeBlock>

      <Demo label="Pick a row on the left" wide>
        <ResourceDemo resource={articlesResource} variant="split" />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "action",
            type: '"read" | "update"',
            default: '"update"',
            description: (
              <>
                What the right pane renders. <C>update</C> makes it an editor, which
                is what makes a split feel like a mail client; <C>read</C> keeps it
                read-only.
              </>
            ),
          },
          {
            name: "emptyState",
            type: "FC",
            description: "Rendered before anything is selected.",
          },
          {
            name: "readInList",
            type: "boolean",
            description: (
              <>
                Makes <C>read/{"{id}"}</C> land on <C>list/{"{id}"}</C>.
              </>
            ),
          },
        ]}
      />

      <H2 id="redirect">Incoming links</H2>

      <P>
        Links built elsewhere — a notification, an email, a share — point at the
        detail <Term id="view">view</Term>. With no detail view to point at, they
        would land nowhere.
      </P>

      <Callout kind="tip" title="That is what readInList is for">
        <P>
          It turns <C>read/42</C> into <C>list/42</C>, so an existing link opens the
          split with that item selected. Set it whenever the split is the only detail
          your resource has.
        </P>
      </Callout>

      <H2 id="columns">Board</H2>

      <P>
        A board: one column per value of a chosen field. It needs two things — which
        field groups the records, and which values are columns.
      </P>

      <CodeBlock>{COLUMNS}</CodeBlock>

      <Demo label="Grouped by status" wide>
        <ResourceDemo resource={articlesResource} variant="board" />
      </Demo>

      <Callout kind="warning" title="Both options are required">
        <P>
          <C>layout.board()</C> without <C>groupBy</C> or <C>columns</C> is a
          TypeScript error, and <C>groupBy</C> must name a field of the item. The{" "}
          <Term id="view-variant">layout</Term> takes its columns as a list on
          purpose: an empty column has to exist to be dropped into, and deriving the
          columns from the data would make it vanish.
        </P>
      </Callout>

      <P>
        <C>columns</C> takes the same option shape as a select field, so
        the field's own <C>valueOptions</C> can be reused directly — one list, both
        places.
      </P>

      <H2 id="dragging">Moving a card</H2>

      <P>
        Dragging a card into another column writes the new value of{" "}
        <C>groupBy</C> through the <Term id="repository">repository</Term>, drawn in
        its new column before the API answers. There is no drag handler to write: moving a card <em>is</em>{" "}
        editing that field.
      </P>

      <H2 id="opening">Opening a card</H2>

      <P>
        The whole card is clickable — with a pointer cursor, a hover state and a
        focus ring — and a click opens the record&apos;s <C>read</C> view, with a way
        to edit it. Where it opens is not the board&apos;s to say: it is{" "}
        <C>views.read.open</C>, the same decision a row&apos;s read button follows.
      </P>

      <CodeBlock>{OPENING}</CodeBlock>

      <Ul>
        <Li>
          <C>drawer</C> slides it in from the right — up from the bottom on a phone.
        </Li>
        <Li>
          <C>dialog</C> centres it in a dialog.
        </Li>
        <Li>
          <C>page</C>, the default, goes to the record's own page, through{" "}
          <C>generateLink</C> and the configured router.
        </Li>
      </Ul>

      <P>
        A drawer or a dialog is written into the URL as a child view of the list —{" "}
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
        “Move to…”, the list&apos;s own <C>bulkActions</C> and “Deselect all”; Escape
        empties the selection too. The selection is declared on{" "}
        <C>views.list</C>, not on the board, so a table, cards or a plain list of
        the same resource select the same way.
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
            name: "views.read.open",
            type: '"page" | "dialog" | "drawer" | OpenFrame',
            default: '"page"',
            description: (
              <>
                Where a click on a card opens the record. Needs the <C>read</C>{" "}
                permission.
              </>
            ),
          },
          {
            name: "views.list.selectable",
            type: "boolean",
            default: "true on a board",
            description: "Whether records can be selected and moved together.",
          },
          {
            name: "views.list.bulkActions",
            type: '(BulkActionInterface | "delete")[]',
            description: (
              <>
                <C>{"{ label, icon?, onAction(records, mutation) }"}</C>, run on the
                selected records; the list refreshes once it settles.{" "}
                <C>"delete"</C> is the built-in deletion of the selection.
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
          <strong>Board</strong> when the interesting operation is moving a record
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
