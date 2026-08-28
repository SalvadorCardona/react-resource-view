import { createFileRoute } from "@tanstack/react-router"
import {
  CalendarDays,
  CalendarRange,
  Columns2,
  Columns3,
  List,
  Rows2,
  Table,
} from "lucide-react"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/layouts")({
  head: () => ({
    meta: [
      { title: "Choosing a layout — react-resource-view" },
      {
        name: "description",
        content:
          "Seven layout factories over one collection. Declare several, and the reader picks — the choice travels in the URL.",
      },
    ],
  }),
  component: Layouts,
})

const VARIANTS = `import {
  cardViewOptionFactory,
  splitViewFactory,
  tableViewOptionFactory,
} from "react-resource-view"

view: {
  form: articleForm,
  viewVariants: [
    tableViewOptionFactory(),        // the default: the first one listed
    cardViewOptionFactory({ grid: 3 }),
    splitViewFactory({ redirectReadToList: true }),
  ],
}`

const IDENTITY = `// A variant is identified by the slug of its name.
tableViewOptionFactory()                    // id: "table"
cardViewOptionFactory()                     // id: "card"
tableViewOptionFactory({ name: "Compact" }) // id: "compact"`

const CUSTOM = `import { createView } from "react-resource-view"

// A factory is just a preset. Nothing stops you writing your own layout.
const heatmapView = createView({
  name: "Heatmap",
  icon: Flame,
  listComponent: MyHeatmap,   // receives { rows }
  rowComponent: MyHeatCell,   // receives { row }
  itemComponent: MyHeatValue, // receives { formInput }
})`

const LAYOUTS = [
  {
    icon: Table,
    factory: "tableViewOptionFactory",
    title: "Table",
    body: "One column per field of the view's form, editable in place. The default for anything with more than three fields worth comparing.",
  },
  {
    icon: Rows2,
    factory: "cardViewOptionFactory",
    title: "Cards",
    body: (
      <>
        A grid of cards, <C>grid</C> per row. Right when a record has a title and a
        couple of attributes.
      </>
    ),
  },
  {
    icon: List,
    factory: "itemViewOptionFactory",
    title: "Item list",
    body: "A plain vertical list. The lightest of the seven, and the one that survives a narrow column.",
  },
  {
    icon: Columns3,
    factory: "columnViewOptionFactory",
    title: "Columns",
    body: (
      <>
        A board grouped by a key — a kanban. Needs <C>identifierKey</C> and{" "}
        <C>identifierKeyList</C>.
      </>
    ),
  },
  {
    icon: Columns2,
    factory: "splitViewFactory",
    title: "Split",
    body: "The list on the left, the selected item on the right. Replaces the separate detail page.",
  },
  {
    icon: CalendarDays,
    factory: "calendarViewOptionFactory",
    title: "Calendar",
    body: (
      <>
        By day, week or month, from a date field. <C>dateKey</C> says which.
      </>
    ),
  },
  {
    icon: CalendarRange,
    factory: "timelineViewOptionFactory",
    title: "Timeline",
    body: "A Gantt-like band per row, grouped by a key — rooms, staff, vehicles.",
  },
]

function Layouts() {
  return (
    <DocArticle
      toc={[
        { id: "seven", title: "The seven factories" },
        { id: "declaring", title: "Declaring several" },
        { id: "identity", title: "How a variant is identified" },
        { id: "shared", title: "What every variant shares" },
        { id: "custom", title: "Writing your own" },
      ]}
    >
      <P>
        A collection is not one screen. The same articles are a table when you are
        comparing them, a board when you are moving them along, and a calendar when
        you are scheduling them. All three are the same resource with a different{" "}
        <C>listComponent</C>.
      </P>

      <H2 id="seven">The seven factories</H2>

      <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
        {LAYOUTS.map(({ icon: Icon, factory, title, body }) => (
          <article
            key={factory}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-view-soft text-view">
                <Icon className="size-4" />
              </span>
              <h3 className="font-medium">{title}</h3>
            </div>
            <code className="mt-3 block font-mono text-[11px] text-view">
              {factory}
            </code>
            <div className="prose-docs mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </div>
          </article>
        ))}
      </div>

      <H2 id="declaring">Declaring several</H2>

      <P>
        <C>viewVariants</C> is a list. Declare more than one and the view renders a
        switcher; the reader's choice is written into the URL, so it survives a
        reload and travels in a shared link.
      </P>

      <CodeBlock>{VARIANTS}</CodeBlock>

      <Demo label="Five layouts over the same articles" code={VARIANTS} wide>
        <ResourceDemo resource={articlesResource} variant="table" />
      </Demo>

      <Callout kind="note" title="The first one wins">
        <P>
          With no variant in the URL, the first of the list is used. Ordering them is
          how you choose the default, and a variant id that no longer exists falls
          back to it rather than rendering nothing.
        </P>
      </Callout>

      <H2 id="identity">How a variant is identified</H2>

      <P>
        Each factory names its variant, and the id is the slug of that name. Pass a{" "}
        <C>name</C> to change both — which you have to do when the same factory
        appears twice.
      </P>

      <CodeBlock>{IDENTITY}</CodeBlock>

      <H2 id="shared">What every variant shares</H2>

      <P>
        A variant is a <C>ViewInterface</C>, so anything a view accepts, a variant
        accepts — and only for that layout:
      </P>

      <Ul>
        <Li>
          <C>form</C> — different columns per layout, if the table needs more than
          the cards.
        </Li>
        <Li>
          <C>itemsPerPage</C> — a grid of cards holds fewer than a table.
        </Li>
        <Li>
          <C>components.top</C>, <C>components.bottom</C>, <C>components.noResult</C>
          , <C>components.pagination</C>.
        </Li>
        <Li>
          <C>behavior.canExport</C> — a CSV export honouring the current filters.
        </Li>
        <Li>
          <C>className</C>, <C>icon</C>, <C>label</C>.
        </Li>
      </Ul>

      <P>
        The three rendering slots are what a factory actually sets:{" "}
        <C>listComponent</C> draws the collection, <C>rowComponent</C> one record,
        and <C>itemComponent</C> one field of a record.
      </P>

      <H2 id="custom">Writing your own</H2>

      <P>
        A factory is a preset over <C>createView</C>, nothing more. A layout of your
        own is three components and one call:
      </P>

      <CodeBlock>{CUSTOM}</CodeBlock>

      <P>
        Inside those components, <C>useList</C> gives the rows and the mutations, and{" "}
        <C>useCurrentViewResourceContext</C> gives the whole context — loading state,
        filters, selection.
      </P>

      <P>
        The next three pages take the built-in layouts one family at a time:{" "}
        <A href="/docs/resource-view/table">table and cards</A>,{" "}
        <A href="/docs/resource-view/split">split and columns</A>, and{" "}
        <A href="/docs/resource-view/calendar">calendar and timeline</A>.
      </P>
    </DocArticle>
  )
}
