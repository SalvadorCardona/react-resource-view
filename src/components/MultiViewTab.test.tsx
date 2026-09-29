import { afterEach, describe, expect, it } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { createViewResource } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { ActionList } from "react-data-form"

/**
 * The navigation between the sub-views of a record: a bar above them, or a
 * menu beside them.
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

function nested(id: string, name: string) {
  return createViewResource<Article>(id, {
    name,
    scope: "tabs",
    getCollection: async () => ({ data: collection(id) }),
    view: { name, listComponent: ArticleList },
  })
}

const commentsResource = nested("tabs_comments", "Comments")
const invoicesResource = nested("tabs_invoices", "Invoices and receipts")

const subViewList = [
  { resourceId: "tabs_comments", resourceAction: ActionList.list },
  { resourceId: "tabs_invoices", resourceAction: ActionList.list },
]

const barResource = createViewResource<Article>("tabs_posts", {
  name: "Posts",
  scope: "tabs",
  getCollection: async () => ({ data: collection("tabs_posts") }),
  view: {
    name: "Posts",
    listComponent: ArticleList,
    subViewResource: { list: subViewList },
  },
})

const menuResource = createViewResource<Article>("tabs_companies", {
  name: "Companies",
  scope: "tabs",
  getCollection: async () => ({ data: collection("tabs_companies") }),
  view: {
    name: "Companies",
    listComponent: ArticleList,
    subViewResource: { orientation: "vertical", list: subViewList },
  },
})

function Summary() {
  return <p>Summary</p>
}

// The left column of a record beside the default, scrolling bar.
const summaryResource = createViewResource<Article>("tabs_accounts", {
  name: "Accounts",
  scope: "tabs",
  getCollection: async () => ({ data: collection("tabs_accounts") }),
  view: {
    name: "Accounts",
    listComponent: ArticleList,
    subViewResource: { viewComponent: Summary, list: subViewList },
  },
})

/** Answers every query the way a screen of that width would. */
function screenWidth(width: number) {
  window.matchMedia = (query: string) =>
    ({
      matches: width >= Number(query.match(/(\d+)px/)?.[1] ?? 0),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList
}

const wideScreen = () => screenWidth(1280)
const phone = () => screenWidth(375)

function renderView(resourceId: string) {
  return render(
    <ResourceViewProvider
      viewResourceContextParams={{ scope: "tabs", resourceId }}
      configuration={{
        resources: [
          barResource,
          menuResource,
          summaryResource,
          commentsResource,
          invoicesResource,
        ],
        defaultScope: "tabs",
      }}
    />
  )
}

afterEach(() => {
  phone()
})

describe("the navigation between sub-views", () => {
  // The bar used to wrap onto as many lines as the tabs needed, and cut the
  // labels to twelve characters to keep that from happening too often.
  it("keeps the tabs on one scrolling line", async () => {
    const { container } = renderView("tabs_posts")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    const scrollArea = container.querySelector('[data-slot="scroll-area"]')!
    expect(scrollArea).toContainElement(
      screen.getByRole("tab", { name: "Comments" })
    )
    // The content element is what `min-width: fit-content` is carried by, and
    // without it the row is capped at the viewport width instead of scrolling.
    expect(
      scrollArea.querySelector('[data-slot="scroll-area-content"]')
    ).not.toBeNull()
    expect(
      screen.getByRole("tab", { name: "Invoices and receipts" })
    ).toHaveTextContent("Invoices and receipts")
  })

  // The scroll area's root sets `position: relative` inline: a `sticky` class
  // on it lost, and its `top` shifted the bar down instead of pinning it.
  it("pins the bar from an element the scroll area does not position", async () => {
    const { container } = renderView("tabs_posts")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    const scrollArea = container.querySelector('[data-slot="scroll-area"]')!
    const sticky = scrollArea.closest(".sticky") as HTMLElement
    expect(sticky).not.toBeNull()
    expect(sticky.style.position).not.toBe("relative")
  })

  it("draws a menu down the side when the view asks for one", async () => {
    wideScreen()
    const { container } = renderView("tabs_companies")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    expect(
      container.querySelector('[data-slot="tabs"][data-orientation="vertical"]')
    ).not.toBeNull()
    expect(container.querySelector('[data-slot="scroll-area"]')).toBeNull()
  })

  // A `1fr` track is never narrower than its content, and the bar is as wide
  // as all its tabs: beside a side column it pushed the page sideways instead
  // of scrolling inside its own track.
  it("keeps the bar inside its track when a column sits beside it", async () => {
    wideScreen()
    const { container } = renderView("tabs_accounts")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    const aside = screen.getByText("Summary").closest("aside")!
    expect(aside.parentElement).toHaveClass("md:grid-cols-[280px_minmax(0,1fr)]")
    expect(container.querySelector('[data-slot="tabs"]')).toHaveClass("min-w-0")
  })

  // A column of tabs on a phone would leave the sub-view a third of the
  // screen, so the option is a desktop one.
  it("falls back to the scrolling bar on a narrow screen", async () => {
    phone()
    const { container } = renderView("tabs_companies")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    expect(
      container.querySelector('[data-slot="tabs"][data-orientation="vertical"]')
    ).toBeNull()
    expect(container.querySelector('[data-slot="scroll-area"]')).not.toBeNull()
  })

  // A grid item is at least as wide as its content: beside the left column the
  // tabs' track used to grow to the whole row of tabs, and the page scrolled
  // sideways rather than the bar. jsdom lays nothing out, so the classes that
  // bound the track are what is checked.
  it("keeps the bar within its column beside a left column", async () => {
    wideScreen()
    const { container } = renderView("tabs_accounts")

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Comments" })).toBeInTheDocument()
    })

    expect(screen.getByText("Summary")).toBeInTheDocument()
    const tabs = container.querySelector(
      '[data-slot="tabs"][data-orientation="horizontal"]'
    )!
    expect(tabs).toHaveClass("min-w-0")
    expect(tabs).toContainElement(
      container.querySelector('[data-slot="scroll-area"]') as HTMLElement
    )
  })
})
