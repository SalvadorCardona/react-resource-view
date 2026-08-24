import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CodeBlock, Layout, pageHref } from "./Layout"
import "./styles.css"

function Page() {
  return (
    <Layout
      title="react-resource-view"
      intro="CRUD views for JSON-LD / Hydra APIs. Declare a resource, and the package renders the list, the details, the forms and the delete confirmation — wired to your API and to the URL."
    >
      <p>
        You describe what a resource is; the package decides nothing about your
        stack. It assumes no router, no backend URL, no country and no visual
        identity — each of those is a port you fill in at startup.
      </p>

      <CodeBlock>{example}</CodeBlock>

      <p>
        That declaration is enough to get a filterable list, a detail view,
        create and edit forms bound to the API, and a delete confirmation — each
        reachable by its own URL.
      </p>

      <h3>Installation</h3>
      <CodeBlock>{install}</CodeBlock>

      <p>
        <code>react-mini-i18n</code> and <code>resource-registry</code> own
        module-level singletons — a dictionary and a registry — so they are peer
        dependencies and must resolve to a single copy.
      </p>

      <h3>Where to go next</h3>
      <ul className="my-4 space-y-2 text-muted-foreground">
        <li>
          <a className="underline underline-offset-4" href={pageHref("routing.html")}>
            Routing
          </a>{" "}
          — carrying a view context in the path, or entirely in the query string.
        </li>
        <li>
          <a className="underline underline-offset-4" href={pageHref("layouts.html")}>
            Layouts
          </a>{" "}
          — table, card, column, split, calendar and timeline.
        </li>
        <li>
          <a className="underline underline-offset-4" href={pageHref("demo.html")}>
            Live demo
          </a>{" "}
          — a resource running in this page, with no server behind it.
        </li>
      </ul>
    </Layout>
  )
}

const example = `import { createViewResource, tableViewOptionFactory } from "react-resource-view"

const articles = createViewResource("articles", {
  path: "/api/articles",
  name: "Articles",
  view: {
    form: {
      inputs: {
        title: { label: "Title", required: true },
        body: { label: "Body" },
      },
    },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [tableViewOptionFactory({ columns: ["title", "published"] })],
  },
})`

const install = `pnpm add react-resource-view react-data-form react-mini-i18n resource-registry`

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>
)
