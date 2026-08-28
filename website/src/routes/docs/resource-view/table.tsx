import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/table")({
  head: () => ({
    meta: [
      { title: "Table and cards — react-resource-view" },
      {
        name: "description",
        content:
          "The two everyday layouts: where the columns come from, how a cell is rendered, and when a card grid reads better.",
      },
    ],
  }),
  component: TableAndCards,
})

const COLUMNS = `view: {
  form: {
    inputs: {
      title:       { label: "Title" },      // column 1
      author:      { label: "Author" },     // column 2
      status:      { label: "Status" },     // column 3
      workspace:   { generatedValue: true },// not a column
    },
  },
  viewVariants: [tableViewOptionFactory()],
}`

const PER_VARIANT = `viewVariants: [
  // The table shows everything…
  tableViewOptionFactory({ form: fullForm }),
  // …the cards, only what fits.
  cardViewOptionFactory({ grid: 3, form: compactForm }),
]`

const CELL = `import { itemViewOptionFactory } from "react-resource-view"

tableViewOptionFactory({
  // One cell. \`formInput\` carries the field *and* its value for this row.
  itemComponent: ({ formInput }) => {
    if (formInput?.name !== "status") return <ItemTable formInput={formInput} />
    return <StatusBadge value={formInput.value} />
  },
})`

const EXPORT = `views: {
  [ActionList.list]: {
    // A CSV export, produced by the API, honouring the current filters.
    behavior: { canExport: true },
  },
}`

function TableAndCards() {
  return (
    <DocArticle
      toc={[
        { id: "columns", title: "Where the columns come from" },
        { id: "editing", title: "Editing in place" },
        { id: "cells", title: "Rendering a cell yourself" },
        { id: "cards", title: "Cards" },
        { id: "pagination", title: "Pagination and export" },
      ]}
    >
      <P>
        These two carry most lists. They read the same description and differ only in
        shape — which is why moving from one to the other is a one-line change, and
        why declaring both costs nothing.
      </P>

      <H2 id="columns">Where the columns come from</H2>

      <P>
        There is no <C>columns</C> array. The table renders one column per field of
        the view's form, in declaration order, skipping fields marked{" "}
        <C>generatedValue</C>. The header is the field's <C>label</C>, passed through
        the translation dictionary.
      </P>

      <CodeBlock>{COLUMNS}</CodeBlock>

      <Callout kind="tip" title="One description, two readings">
        <P>
          The consequence is worth stating plainly: adding a column adds an editable
          field, and marking a field required makes the create form require it.
          Nothing can drift, because there is only one description.
        </P>
      </Callout>

      <P>
        When the table wants more than the cards, give each variant its own{" "}
        <C>form</C>:
      </P>

      <CodeBlock>{PER_VARIANT}</CodeBlock>

      <H2 id="editing">Editing in place</H2>

      <P>
        A table cell is rendered by the same controller the form would use, so a row
        is editable where it stands — no modal, no separate edit mode. A change
        writes through the repository and the list refetches.
      </P>

      <Demo label="Change a status in the table" wide>
        <ResourceDemo resource={articlesResource} variant="table" />
      </Demo>

      <P>
        Mark a field <C>readonly</C> to show it without letting it be edited from the
        list.
      </P>

      <H2 id="cells">Rendering a cell yourself</H2>

      <P>
        <C>itemComponent</C> renders one field of one row. It receives the{" "}
        <C>formInput</C> — the field description carrying this row's value — so it
        can decide by field name and fall back to the default for the rest.
      </P>

      <CodeBlock>{CELL}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "listComponent",
            type: "FC<{ rows, children }>",
            description: "Draws the whole collection. The table or the grid itself.",
          },
          {
            name: "rowComponent",
            type: "FC<{ row, children }>",
            description: "Draws one record — a table row, a card.",
          },
          {
            name: "itemComponent",
            type: "FC<{ formInput, children }>",
            description: "Draws one field of one record — a cell.",
          },
          {
            name: "components.top / bottom",
            type: "FC",
            description:
              "Rendered above and below the list — a summary bar, a legend.",
          },
          {
            name: "components.noResult",
            type: "FC",
            description: "Replaces the empty state.",
          },
          {
            name: "components.pagination",
            type: "FC",
            description: "Replaces the pager.",
          },
        ]}
      />

      <P>
        <C>ItemRender</C> is exported for the fallback: it turns a value into
        something readable — dates, booleans, IRIs — which is what the default cell
        uses.
      </P>

      <H2 id="cards">Cards</H2>

      <P>
        <C>cardViewOptionFactory</C> takes one extra option, <C>grid</C>, the number
        of cards per row. Four by default.
      </P>

      <Demo label="The same articles as cards" wide>
        <ResourceDemo resource={articlesResource} variant="card" />
      </Demo>

      <P>Cards read better than a table when:</P>

      <Ul>
        <Li>a record has a dominant field — a title, a name, an image;</Li>
        <Li>there are fewer than four attributes worth showing;</Li>
        <Li>
          the list is browsed rather than compared — comparison is what columns are
          for.
        </Li>
      </Ul>

      <H2 id="pagination">Pagination and export</H2>

      <P>
        <C>itemsPerPage</C> sets the page size — thirty by default — and the current
        page travels in the URL alongside the filters, so a link to page four is a
        link to page four.
      </P>

      <CodeBlock>{EXPORT}</CodeBlock>

      <P>
        <C>behavior.canExport</C> adds an export button. The export is produced by
        the API in CSV and carries the filters currently applied, so what is
        downloaded is what is on screen.
      </P>

      <Callout kind="note" title="Filters live next door">
        <P>
          The filter bar above the list is an ordinary form with <C>saveOnChange</C>.
          It has <A href="/docs/resource-view/filters">its own page</A>.
        </P>
      </Callout>
    </DocArticle>
  )
}
