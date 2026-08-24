import { createViewResource } from "react-resource-view"
import { BookOpen } from "lucide-react"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

/**
 * The landing page.
 *
 * Like every page here it is a resource with a `viewComponent`, which is the
 * same mechanism an application uses to render a custom screen inside the views.
 */
const overviewResource = createViewResource("overview", {
  name: "Overview",
  scope: "docs",
  icon: BookOpen,
  view: {
    name: "Overview",
    viewComponent: () => (
      <>
        <PageHeader
          title="react-resource-view"
          intro="CRUD views for JSON-LD / Hydra APIs. Declare a resource, and the package renders the list, the details, the forms and the delete confirmation — wired to your API and to the URL."
        />

        <Section
          title="Declare a resource"
          intro="You describe what a resource is; the package decides nothing about your stack."
        >
          <CodeBlock>{example}</CodeBlock>
          <p>
            That is enough for a filterable list, a detail view, create and edit
            forms bound to the API, and a delete confirmation — each reachable
            by its own URL.
          </p>
        </Section>

        <Section
          title="This site is built with it"
          intro="Every page you are reading is a resource, and the sidebar is the library's own menu."
        >
          <p>
            There is no separate documentation framework here. Each page calls{" "}
            <code>createViewResource</code> with a <code>viewComponent</code>,
            the scope lists them in its menu, and the routing you can read about
            on the next page decides what the URL looks like.
          </p>
          <CodeBlock>{selfDoc}</CodeBlock>
        </Section>

        <Section title="Installation">
          <CodeBlock>{install}</CodeBlock>
          <p>
            <code>react-mini-i18n</code> and <code>resource-registry</code> own
            module-level singletons — a dictionary and a registry — so they are
            peer dependencies and must resolve to a single copy.
          </p>
        </Section>
      </>
    ),
  },
})

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

const selfDoc = `const overviewResource = createViewResource("overview", {
  name: "Overview",
  scope: "docs",
  view: { viewComponent: () => <OverviewPage /> },
})`

const install = `pnpm add react-resource-view react-data-form react-mini-i18n resource-registry`

export default overviewResource
