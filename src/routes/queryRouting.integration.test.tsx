import { afterEach, describe, expect, it } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { setInStorage } from "ssr-safe-storage"
import { configurePorts, createViewResource, parseLink } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"

/**
 * What the documentation site does: a resource with no `path`, reading fixtures
 * from storage, with its whole context carried in the query string.
 *
 * This is the arrangement a static host can serve — no server answers a deep
 * path there — so it is worth pinning down that it actually renders.
 */
interface Article {
  "@id": string
  "@type": string
  id: string
  title: string
}

const ARTICLES: Article[] = [
  { "@id": "/api/articles/1", "@type": "Article", id: "1", title: "First article" },
  { "@id": "/api/articles/2", "@type": "Article", id: "2", title: "Second article" },
]

const seed = () =>
  setInStorage("demo_articles", {
    "@id": "demo_articles",
    "@type": "Collection",
    member: ARTICLES,
    totalItems: ARTICLES.length,
  })

// The table layout derives its columns from the form, so a view without one
// renders a notice instead of rows.
const resource = createViewResource<Article>("demo_articles", {
  name: "Articles",
  scope: "demo",
  view: {
    name: "Articles",
    form: { inputs: { title: { label: "Title" } } },
  },
})

afterEach(() => {
  configurePorts({ routing: { mode: "path", param: "view", basePath: "" } })
  localStorage.clear()
})

describe("a resource rendered from a query-mode URL", () => {
  it("renders the list the URL asks for", async () => {
    seed()
    configurePorts({
      routing: { mode: "query", param: "view", basePath: "/demo.html" },
    })

    const params = parseLink("/demo.html?view=demo/demo_articles/list")
    expect(params).toMatchObject({
      scope: "demo",
      resourceId: "demo_articles",
      resourceAction: "list",
    })

    render(
      <ResourceViewProvider
        viewResourceContextParams={{ ...params, scope: "demo" }}
        configuration={{ resources: [resource], defaultScope: "demo" }}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("First article")).toBeInTheDocument()
    })
    expect(screen.getByText("Second article")).toBeInTheDocument()
  })

  it("mounts the item view when the URL points at one", async () => {
    seed()
    configurePorts({
      routing: { mode: "query", param: "view", basePath: "/demo.html" },
    })

    const params = parseLink("/demo.html?view=demo/demo_articles/read/2")
    expect(params).toMatchObject({ resourceAction: "read", id: "2" })

    const { container } = render(
      <ResourceViewProvider
        viewResourceContextParams={{ ...params, scope: "demo" }}
        configuration={{ resources: [resource], defaultScope: "demo" }}
      />
    )

    // The action carried by the query selects the view: a single-item one here,
    // rather than the list rendered by the previous test.
    await waitFor(() => {
      expect(container.querySelector('[role="edit-view"]')).not.toBeNull()
    })
    expect(screen.queryByText("First article")).toBeNull()
  })
})
