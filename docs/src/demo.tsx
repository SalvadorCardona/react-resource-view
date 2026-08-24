import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { parseLink } from "react-resource-view"
import { CodeBlock, Layout, pageHref } from "./Layout"
import {
  articlesResource,
  configureDemoRouting,
  seedDemoData,
} from "./demoResource"
import "./styles.css"

seedDemoData()
configureDemoRouting(pageHref("demo.html"))

/**
 * Renders the resource for whatever the URL currently says, and follows the
 * back button.
 *
 * The fallback navigation performs full page loads, which is exactly what a
 * static host serves well: every link is a real request for demo.html, with
 * the view context in its query string.
 */
function Demo() {
  const [params, setParams] = useState(() =>
    parseLink(window.location.pathname + window.location.search)
  )

  useEffect(() => {
    const onPopState = () =>
      setParams(parseLink(window.location.pathname + window.location.search))
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  return (
    <ResourceViewProvider
      viewResourceContextParams={{ ...params, scope: "demo" }}
      configuration={{ resources: [articlesResource], defaultScope: "demo" }}
    />
  )
}

function DemoPage() {
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : ""

  return (
    <Layout
      title="Live demo"
      intro="A resource rendered right here, reading four articles from your browser's storage. No server is involved — which is the point."
    >
      <p>
        Click a row, filter the list, open the create form: the URL in your
        address bar changes, and it stays a query on a single real file.
      </p>

      <CodeBlock>{currentUrl || "demo.html"}</CodeBlock>

      <p>
        Copy that URL into a new tab and you land on the same view. That is the
        whole point of query mode: this page is served by a static host, which
        has no way to answer <code>/demo/demo_articles/read/2</code>.
      </p>

      <div className="not-prose my-8 rounded-xl border border-border bg-card p-5">
        <Demo />
      </div>

      <h3>What is running</h3>
      <p>
        The resource declares no <code>path</code>, so it falls back to the
        local repository and reads fixtures from <code>localStorage</code>:
      </p>
      <CodeBlock>{setup}</CodeBlock>
    </Layout>
  )
}

const setup = `import { createViewResource, configurePorts } from "react-resource-view"

configurePorts({
  routing: { mode: "query", param: "view", basePath: "/demo.html" },
})

// No \`path\`: the views read from localStorage instead of an API.
export const articlesResource = createViewResource("demo_articles", {
  name: "Articles",
  scope: "demo",
  view: {
    form: { inputs: { title: { label: "Title" }, author: { label: "Author" } } },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [
      tableViewOptionFactory({ columns: ["title", "author", "published"] }),
      cardViewOptionFactory({ grid: 3 }),
    ],
  },
})`

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoPage />
  </StrictMode>
)
