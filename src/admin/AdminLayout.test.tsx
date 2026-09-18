import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createItemMenuWithResource, createViewResource } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { AdminLayout } from "@/admin/AdminLayout"
import { ScopeInterface } from "@/scope/scopeInterface"

/**
 * `AdminLayout` used as a scope's `decoratorComponent`: a ready-made admin
 * shell built from nothing but the scope's `menu`.
 */
interface Article {
  "@id": string
  "@type": string
  id: string
  title: string
}

function ArticleList() {
  return <div data-testid="rows" />
}

const articlesResource = createViewResource<Article>("admin_articles", {
  name: "Articles",
  scope: "admin",
  getCollection: async () => ({
    data: {
      "@id": "admin_articles",
      "@type": "Collection",
      member: [],
      totalItems: 0,
    },
  }),
  view: { name: "Articles", listComponent: ArticleList },
})

const usersResource = createViewResource<Article>("admin_users", {
  name: "Users",
  scope: "admin",
  getCollection: async () => ({
    data: { "@id": "admin_users", "@type": "Collection", member: [], totalItems: 0 },
  }),
  view: { name: "Users", listComponent: ArticleList },
})

const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: AdminLayout,
  resources: [articlesResource, usersResource],
  menu: [
    createItemMenuWithResource({ resource: articlesResource }),
    createItemMenuWithResource({ resource: usersResource }),
  ],
  defaultViewResourceContextParams: {
    resourceId: articlesResource["@id"],
  },
}

// `configuration.scopes` resolves the scope through `use()`, inside the
// `Suspense` boundary `ResourceViewProvider` sets up for that. Rendering
// outside `act` leaves that first suspend-and-resolve cycle unflushed.
async function renderAdmin() {
  let result!: ReturnType<typeof render>

  await act(async () => {
    result = render(
      <ResourceViewProvider
        configuration={{
          scopes: { admin: async () => adminScope },
          defaultScope: "admin",
        }}
      />
    )
  })

  return result
}

describe("AdminLayout", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the scope's menu as navigation links, and the current view", async () => {
    await renderAdmin()

    expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Articles" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument()
  })

  it("swaps the sidebar for a bottom navigation bar on narrow screens", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList
    )

    await renderAdmin()

    expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Articles" })).toBeNull()
    expect(screen.getByRole("button", { name: "Articles" })).toBeInTheDocument()
  })
})
