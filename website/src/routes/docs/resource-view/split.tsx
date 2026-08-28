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
