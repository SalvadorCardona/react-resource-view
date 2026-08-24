import { createViewResource } from "react-resource-view"
import { Columns3 } from "lucide-react"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

const layouts: [string, string][] = [
  ["tableViewOptionFactory", "Data table, editable in place"],
  ["cardViewOptionFactory", "Card grid"],
  ["columnViewOptionFactory", "Columns, grouped by a key"],
  ["splitViewFactory", "List on the left, details on the right"],
  ["calendarViewOptionFactory", "Calendar, by day or week"],
  ["timelineViewOptionFactory", "Timeline, grouped by row"],
  ["itemViewOptionFactory", "Plain item list"],
]

const layoutsResource = createViewResource("layouts", {
  name: "Layouts",
  scope: "docs",
  icon: Columns3,
  view: {
    name: "Layouts",
    viewComponent: () => (
      <>
        <PageHeader
          title="Layouts"
          intro="A list renders through one of several variants. Declare more than one and the reader picks — their choice is kept in the URL."
        />

        <Section title="Available variants">
          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Factory</th>
                  <th className="py-2 font-medium">Layout</th>
                </tr>
              </thead>
              <tbody>
                {layouts.map(([name, description]) => (
                  <tr key={name} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">{name}</td>
                    <td className="py-2 text-muted-foreground">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock>{variants}</CodeBlock>
        </Section>

        <Section
          title="The table needs a form"
          intro="It derives its columns from the form's inputs."
        >
          <p>
            A view declaring no <code>form</code> renders a notice instead of
            rows. The form is what tells the table which fields exist, what to
            label them, and how to edit a cell in place.
          </p>
        </Section>

        <Section
          title="Filters"
          intro="formFilter declares the filter form; defaultFilter the filters applied as long as the URL carries none of its own."
        >
          <CodeBlock>{filters}</CodeBlock>
          <p>
            The distinction matters. A <code>defaultValue</code> on a filter
            input would not do the same job: the first request goes out before
            the form exists, so the list would show something other than what
            the filters display.
          </p>
        </Section>
      </>
    ),
  },
})

const variants = `view: {
  viewVariants: [
    tableViewOptionFactory({ columns: ["title", "author", "published"] }),
    cardViewOptionFactory({ grid: 3 }),
  ],
}`

const filters = `view: {
  formFilter: { inputs: { published: { label: "Published" } } },
  defaultFilter: { published: true },
}`

export default layoutsResource
