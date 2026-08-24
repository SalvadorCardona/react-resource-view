import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CodeBlock, Layout, pageHref } from "./Layout"
import "./styles.css"

function Page() {
  return (
    <Layout
      title="Routing"
      intro="A view context — which resource, which action, which item — has to live somewhere in the URL. Two places are available, and the second is what makes this very site possible."
    >
      <h3>In the path, by default</h3>
      <p>
        Links read as <code>/admin/articles/update/42</code>. It is legible, it
        is what an application with its own server wants, and it is the default.
      </p>
      <CodeBlock>{pathMode}</CodeBlock>

      <h3>In the query string</h3>
      <p>
        A static host — GitHub Pages, an S3 bucket, a CDN — serves files. Ask it
        for <code>/admin/articles/update/42</code> and it looks for that file,
        finds nothing, and answers 404. The path is simply not yours to invent.
      </p>
      <p>Query mode writes the same context against one real file:</p>
      <CodeBlock>{queryMode}</CodeBlock>
      <p>
        Same information, same parser, one request the host can actually serve.
        The{" "}
        <a className="underline underline-offset-4" href={pageHref("demo.html")}>
          live demo
        </a>{" "}
        runs in this mode — watch your address bar as you click through it.
      </p>

      <h3>Reading is forgiving</h3>
      <p>
        <code>parseLink</code> recognises a URL carrying the routing parameter
        whatever mode is configured. A link copied out of a statically hosted
        page keeps working when it is opened somewhere else.
      </p>
      <CodeBlock>{parsing}</CodeBlock>

      <h3>Connecting a router</h3>
      <p>
        The views navigate, but the package imports no router. It asks for four
        primitives, and ships an adapter for TanStack Router:
      </p>
      <CodeBlock>{adapter}</CodeBlock>
      <p>
        Importing <code>react-resource-view/tanstack</code> is what pulls
        TanStack Router in — the core never mentions it, so an application on
        React Router installs nothing extra. With any other router, supply the
        four yourself:
      </p>
      <CodeBlock>{custom}</CodeBlock>
      <p>
        Left unconfigured, navigation falls back to full page loads through the
        History API. That is enough for a test, a story — or a static site like
        this one.
      </p>
    </Layout>
  )
}

const pathMode = `configurePorts({ routing: { mode: "path" } }) // the default

generateLink({
  scope: "admin",
  resourceId: "articles",
  resourceAction: ActionList.update,
  id: "42",
})
// → /admin/articles/update/42`

const queryMode = `configurePorts({
  routing: { mode: "query", param: "view", basePath: "/demo.html" },
})

generateLink({
  scope: "admin",
  resourceId: "articles",
  resourceAction: ActionList.update,
  id: "42",
})
// → /demo.html?view=admin/articles/update/42`

const parsing = `parseLink("/demo.html?view=admin/articles/update/42")
// → { scope: "admin", resourceId: "articles", resourceAction: "update", id: "42" }

parseLink("/admin/articles/update/42")
// → the same object`

const adapter = `import { configurePorts } from "react-resource-view"
import { tanstackAdapter } from "react-resource-view/tanstack"

configurePorts({ navigation: tanstackAdapter })`

const custom = `configurePorts({
  navigation: {
    useNavigate: () => navigateFn,     // ({ to, replace, resetScroll }) => void
    useLocation: () => ({ pathname, searchStr }),
    Link: ({ to, children, ...rest }) => <RouterLink to={to} {...rest}>{children}</RouterLink>,
    Navigate: ({ to, replace }) => <RouterRedirect to={to} replace={replace} />,
  },
})`

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>
)
