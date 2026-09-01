import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { createViewResource } from "@/utils/createViewResource"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { configureApi, resetApiConfig } from "@/api/apiConfig"
import { strapiDialect } from "@/api/dialect/strapiDialect"
import { supabaseDialect } from "@/api/dialect/supabaseDialect"
import tableViewOptionFactory from "@/views/list/component/table/tableViewOptionFactory"

/**
 * The same declared resource, rendered against two backends that agree on
 * nothing: not the URL of a page, not the envelope of a collection, not the
 * name of an identifier. What the reader sees must be the same list.
 */

const requests: string[] = []

function respondWith(body: unknown, headers: Record<string, string> = {}) {
  return vi.fn(async (url: string) => {
    requests.push(String(url))
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json", ...headers },
    })
  }) as unknown as typeof fetch
}

const view = {
  name: "Articles",
  itemsPerPage: 25,
  form: { inputs: { title: { label: "Title" } } },
  viewVariants: [tableViewOptionFactory({})],
}

afterEach(() => {
  resetApiConfig()
  requests.length = 0
  localStorage.clear()
})

describe("a resource declared once, rendered against Strapi", () => {
  it("lists the entries of a v5 collection", async () => {
    configureApi({
      baseUrl: "https://cms.example.com",
      fetch: respondWith({
        data: [
          { id: 1, documentId: "kx8f2", title: "Hello from Strapi" },
          { id: 2, documentId: "m91ab", title: "Second entry" },
        ],
        meta: { pagination: { page: 1, pageSize: 25, pageCount: 4, total: 84 } },
      }),
    })

    const articles = createViewResource("strapi_articles", {
      path: "articles",
      name: "Articles",
      scope: "strapi",
      dialect: strapiDialect(),
      view,
    })

    render(
      <ResourceViewProvider
        viewResourceContextParams={{
          scope: "strapi",
          resourceId: "strapi_articles",
        }}
        configuration={{ resources: [articles], defaultScope: "strapi" }}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Hello from Strapi")).toBeInTheDocument()
    })
    expect(screen.getByText("Second entry")).toBeInTheDocument()

    // The page size the view declares travels with the request, so the
    // pagination on screen counts the same rows the API returned.
    expect(requests[0]).toContain("https://cms.example.com/api/articles")
    expect(requests[0]).toContain("pagination%5BpageSize%5D=25")
    // The count Strapi reported drives the pagination, not the rows on screen.
    expect(screen.getAllByText("84").length).toBeGreaterThan(0)
  })
})

describe("a resource declared once, rendered against Supabase", () => {
  it("lists the rows of a table, and counts them from the response headers", async () => {
    configureApi({
      baseUrl: "https://project.supabase.co",
      fetch: respondWith(
        [
          { id: 1, title: "Hello from Supabase" },
          { id: 2, title: "Second row" },
        ],
        { "content-range": "0-1/84" }
      ),
    })

    const articles = createViewResource("supabase_articles", {
      path: "articles",
      name: "Articles",
      scope: "supabase",
      dialect: supabaseDialect({ apiKey: "anon-key" }),
      view,
    })

    render(
      <ResourceViewProvider
        viewResourceContextParams={{
          scope: "supabase",
          resourceId: "supabase_articles",
        }}
        configuration={{ resources: [articles], defaultScope: "supabase" }}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Hello from Supabase")).toBeInTheDocument()
    })
    expect(screen.getByText("Second row")).toBeInTheDocument()

    expect(requests[0]).toContain("https://project.supabase.co/rest/v1/articles")
    expect(requests[0]).toContain("limit=25")
    // The count arrived in Content-Range and survived into the envelope.
    expect(screen.getAllByText("84").length).toBeGreaterThan(0)
  })
})
