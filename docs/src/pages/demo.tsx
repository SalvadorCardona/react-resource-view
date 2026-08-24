import { ActionList } from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
  ViewResourceContextProvider,
} from "react-resource-view"
import { setInStorage } from "ssr-safe-storage"
import { PlayCircle } from "lucide-react"
import { CodeBlock, LiveExample, PageHeader, Section } from "../DocLayout"

export interface Article {
  "@id": string
  "@type": string
  id: string
  title: string
  author: string
  published: boolean
}

const ARTICLES: Article[] = [
  {
    "@id": "/api/articles/1",
    "@type": "Article",
    id: "1",
    title: "Describing a form as data",
    author: "Ada",
    published: true,
  },
  {
    "@id": "/api/articles/2",
    "@type": "Article",
    id: "2",
    title: "Reading an IRI without thinking about it",
    author: "Grace",
    published: true,
  },
  {
    "@id": "/api/articles/3",
    "@type": "Article",
    id: "3",
    title: "Why a deep path 404s on static hosting",
    author: "Ada",
    published: false,
  },
  {
    "@id": "/api/articles/4",
    "@type": "Article",
    id: "4",
    title: "One registry, or none at all",
    author: "Alan",
    published: false,
  },
]

/**
 * Seeds the fixtures the demo reads.
 *
 * The resource below declares no `path`, so it falls back to the localStorage
 * repository — the whole thing runs in the browser, which is all a statically
 * hosted page can offer.
 */
export function seedDemoData(): void {
  setInStorage("demo_articles", {
    "@id": "demo_articles",
    "@type": "Collection",
    member: ARTICLES,
    totalItems: ARTICLES.length,
  })
}

/** The resource the demo renders — an ordinary declaration, nothing special. */
export const articlesResource = createViewResource<Article>("demo_articles", {
  name: "Articles",
  scope: "docs",
  view: {
    name: "Articles",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        published: { label: "Published" },
      },
    },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [
      tableViewOptionFactory({}),
      cardViewOptionFactory({ grid: 2 }),
    ],
  },
})

const demoResource = createViewResource("demo", {
  name: "Live demo",
  scope: "docs",
  icon: PlayCircle,
  view: {
    name: "Live demo",
    viewComponent: () => (
      <>
        <PageHeader
          title="Live demo"
          intro="The resource declared below, rendered right here. Four articles read from your browser's storage — no server is involved, which is the point."
        />

        <Section
          title="Running"
          intro="Filter the list, switch between the table and the card layout, open an item. Everything you do lands in the URL."
        >
          <LiveExample label="A resource, embedded in this page">
            <ViewResourceContextProvider
              resource={articlesResource}
              resourceAction={ActionList.list}
              scope="docs"
            />
          </LiveExample>
          <p>
            The views are nested inside this page through{" "}
            <code>ViewResourceContextProvider</code>, the same component an
            application uses to render a sub-resource inside another view.
          </p>
        </Section>

        <Section
          title="What is declared"
          intro="No path, so the views read fixtures rather than an API."
        >
          <CodeBlock>{setup}</CodeBlock>
          <p>
            Swapping <code>localStorage</code> for a real API is one line: give
            the resource a <code>path</code>, and{" "}
            <code>httpRepository</code> takes over.
          </p>
        </Section>
      </>
    ),
  },
})

const setup = `// No \`path\`: the views read from localStorage instead of an API.
export const articlesResource = createViewResource("demo_articles", {
  name: "Articles",
  scope: "docs",
  view: {
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        published: { label: "Published" },
      },
    },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [tableViewOptionFactory({}), cardViewOptionFactory({ grid: 2 })],
  },
})`

export default demoResource
