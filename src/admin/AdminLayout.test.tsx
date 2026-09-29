import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createItemMenuWithResource, createViewResource } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { AdminLayout } from "@/admin/AdminLayout"
import { ScopeInterface } from "@/scope/scopeInterface"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { ActionList } from "react-data-form"

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
  canRead: true,
  canUpdate: true,
  canDelete: true,
  getItem: async () => ({
    data: {
      "@id": "/api/articles/1",
      "@type": "Article",
      id: "1",
      title: "Describing a form as data",
    },
  }),
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

// A board: the one view of the scope that takes the page's whole width.
const tasksResource = createViewResource<Article>("admin_tasks", {
  name: "Tasks",
  scope: "admin",
  getCollection: async () => ({
    data: { "@id": "admin_tasks", "@type": "Collection", member: [], totalItems: 0 },
  }),
  view: { name: "Tasks", listComponent: ArticleList, fullWidth: true },
})

const adminScope: ScopeInterface = {
  name: "admin",
  label: "Back office",
  decoratorComponent: AdminLayout,
  resources: [articlesResource, usersResource, tasksResource],
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
async function renderAdmin(viewResourceContextParams?: ViewResourceContextParams) {
  let result!: ReturnType<typeof render>

  await act(async () => {
    result = render(
      <ResourceViewProvider
        viewResourceContextParams={viewResourceContextParams}
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

  it("folds the sidebar away when the top bar button is pressed", async () => {
    // The regression this guards: the button only ever opened the mobile
    // drawer, so on the screen where it is shown — the wide one — pressing it
    // did nothing at all.
    await renderAdmin()

    const sidebar = document.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toHaveAttribute("data-state", "expanded")

    await act(async () => {
      screen.getByRole("button", { name: "Toggle sidebar" }).click()
    })

    expect(sidebar).toHaveAttribute("data-state", "collapsed")
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

  it("names the record being edited, and leads back to its list", async () => {
    // The regression this guards: an edit page titled "Edit — Articles" and
    // nothing else, under a top bar with nothing in it — which record, and
    // how to get back, were left for the reader to work out.
    await renderAdmin({
      scope: "admin",
      resourceId: articlesResource["@id"],
      resourceAction: ActionList.update,
      id: "1",
    })

    expect(
      await screen.findByRole("heading", { name: "Describing a form as data" })
    ).toBeInTheDocument()
    expect(screen.getByText("Edit — Articles · #1")).toBeInTheDocument()

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" })
    expect(breadcrumb).toHaveTextContent("Back office")
    expect(breadcrumb).toHaveTextContent("Describing a form as data")

    const backLinks = screen
      .getAllByRole("link", { name: "Articles" })
      .filter((link) => link.getAttribute("href")?.includes("admin_articles/list"))
    // The one in the breadcrumb, and the one above the title.
    expect(backLinks.length).toBeGreaterThanOrEqual(2)

    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument()
  })

  it("lets a view write its own title and actions", async () => {
    const view = articlesResource.views!.update!
    const components = view.components
    view.components = {
      ...components,
      title: () => <h2>Custom title</h2>,
      actions: () => <button>Publish</button>,
    }

    try {
      await renderAdmin({
        scope: "admin",
        resourceId: articlesResource["@id"],
        resourceAction: ActionList.update,
        id: "1",
      })

      expect(
        await screen.findByRole("heading", { name: "Custom title" })
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "delete" })).toBeNull()
    } finally {
      view.components = components
    }
  })

  it("keeps views in a column, unless one asks for the whole width", async () => {
    await renderAdmin()

    const content = document.querySelector('[data-slot="admin-content"]')
    expect(content).toHaveClass("max-w-6xl")
    expect(content).not.toHaveAttribute("data-full-width")
  })

  it("gives the whole width to a view declared fullWidth", async () => {
    await renderAdmin({
      scope: "admin",
      resourceId: tasksResource["@id"],
      resourceAction: ActionList.list,
    })

    const content = document.querySelector('[data-slot="admin-content"]')
    expect(content).not.toHaveClass("max-w-6xl")
    expect(content).toHaveAttribute("data-full-width", "true")
    // The side margins stay.
    expect(content).toHaveClass("px-4")
  })
})
