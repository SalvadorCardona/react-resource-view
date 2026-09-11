import { describe, expect, it } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { createView, createViewResource } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { ActionList } from "react-data-form"

/**
 * The header a list introduces itself with: the resource's icon, its name and
 * the sentence describing it, beside the layout switcher and the create button.
 */
interface Article {
  "@id": string
  "@type": string
  id: string
  title: string
}

const ARTICLES: Article[] = [
  { "@id": "/api/articles/1", "@type": "Article", id: "1", title: "First article" },
]

function collection(id: string) {
  return {
    "@id": id,
    "@type": "Collection",
    member: ARTICLES,
    totalItems: ARTICLES.length,
  }
}

function ArticleList({ rows = [] }: ListComponentPropsInterface) {
  return <div data-testid="rows">{rows.length}</div>
}

function ArticleIcon({ className }: { className?: string }) {
  return <svg data-testid="resource-icon" className={className} />
}

const headedResource = createViewResource<Article>("header_articles", {
  name: "Articles",
  scope: "header",
  icon: ArticleIcon,
  canCreate: true,
  getCollection: async () => ({ data: collection("header_articles") }),
  view: {
    name: "Articles",
    description: "Your resource collection",
    viewVariants: [
      createView({ name: "Alpha", listComponent: ArticleList }),
      createView({ name: "Beta", listComponent: ArticleList }),
    ],
  },
})

/** A list held inside another one: the tab above it already names it. */
const nestedResource = createViewResource<Article>("header_comments", {
  name: "Comments",
  scope: "header",
  getCollection: async () => ({ data: collection("header_comments") }),
  view: { name: "Comments", listComponent: ArticleList },
})

const hostResource = createViewResource<Article>("header_posts", {
  name: "Posts",
  scope: "header",
  getCollection: async () => ({ data: collection("header_posts") }),
  view: {
    name: "Posts",
    listComponent: ArticleList,
    subViewResource: {
      list: [{ resourceId: "header_comments", resourceAction: ActionList.list }],
    },
  },
})

function renderList(resourceId: string) {
  return render(
    <ResourceViewProvider
      viewResourceContextParams={{ scope: "header", resourceId }}
      configuration={{
        resources: [headedResource, nestedResource, hostResource],
        defaultScope: "header",
      }}
    />
  )
}

describe("the header of a list", () => {
  it("says which collection is on screen, and shows the resource's icon", async () => {
    renderList("header_articles")

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument()
    })
    expect(screen.getByText("Your resource collection")).toBeInTheDocument()
    expect(screen.getByTestId("resource-icon")).toBeInTheDocument()
  })

  // The three controls a list owes its reader sit on the same line as its
  // name, rather than stacked above it as they used to be.
  it("holds the layout switcher and the create button", async () => {
    const { container } = renderList("header_articles")

    await screen.findByRole("heading", { name: "Articles" })
    const header = container.querySelector('[data-slot="list-header"]')!

    expect(header).toContainElement(screen.getByRole("tab", { name: "Alpha" }))
    expect(header).toContainElement(screen.getByRole("button", { name: /create/i }))
  })

  // They share one container so that a name too long for the line takes the
  // whole bar down with it, rather than the create button alone.
  it("keeps the switcher and the actions in the same bar", async () => {
    const { container } = renderList("header_articles")

    await screen.findByRole("heading", { name: "Articles" })
    const controls = container.querySelector('[data-slot="list-header-controls"]')!

    expect(controls).toContainElement(screen.getByRole("tab", { name: "Alpha" }))
    expect(controls).toContainElement(
      screen.getByRole("button", { name: /create/i })
    )
  })

  // A sub-view tab writes the name of the resource it opens; the list inside
  // it would otherwise write it a second time, right underneath.
  it("leaves a nested list unnamed, since what contains it names it", async () => {
    renderList("header_posts")

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument()
    })
    expect(screen.queryByRole("heading", { name: "Comments" })).toBeNull()
  })
})
