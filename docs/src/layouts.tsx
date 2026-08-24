import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CodeBlock, Layout, pageHref } from "./Layout"
import "./styles.css"

const layouts = [
  ["tableViewOptionFactory", "Data table, editable in place"],
  ["cardViewOptionFactory", "Card grid"],
  ["columnViewOptionFactory", "Columns, grouped by a key"],
  ["splitViewFactory", "List on the left, details on the right"],
  ["calendarViewOptionFactory", "Calendar, by day or week"],
  ["timelineViewOptionFactory", "Timeline, grouped by row"],
  ["itemViewOptionFactory", "Plain item list"],
]

function Page() {
  return (
    <Layout
      title="Layouts"
      intro="A list renders through one of several variants. Declare more than one and the reader picks — their choice is kept in the URL."
    >
      <div className="not-prose my-6 overflow-x-auto">
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

      <h3>Filters</h3>
      <p>
        <code>formFilter</code> declares the filter form;{" "}
        <code>defaultFilter</code> the filters applied as long as the URL
        carries none of its own.
      </p>
      <CodeBlock>{filters}</CodeBlock>
      <p>
        The distinction matters. A <code>defaultValue</code> on a filter input
        would not do the same job: the first request goes out before the form
        exists, so the list would show something other than what the filters
        display.
      </p>

      <h3>See one running</h3>
      <p>
        The{" "}
        <a className="underline underline-offset-4" href={pageHref("demo.html")}>
          live demo
        </a>{" "}
        declares a table and a card grid on the same resource — switch between
        them and watch the URL.
      </p>
    </Layout>
  )
}

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>
)
