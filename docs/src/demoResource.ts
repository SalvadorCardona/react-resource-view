import { ActionList } from "react-data-form"
import {
  cardViewOptionFactory,
  configurePorts,
  createViewResource,
  tableViewOptionFactory,
} from "react-resource-view"
import { setInStorage } from "ssr-safe-storage"

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
 * With no `path`, the resource falls back to `localStorageRepository`, so the
 * whole demo runs in the browser — no server, which is what a statically hosted
 * page can offer.
 */
export function seedDemoData(): void {
  setInStorage("demo_articles", {
    "@id": "demo_articles",
    "@type": "Collection",
    member: ARTICLES,
    totalItems: ARTICLES.length,
  })
}

/**
 * Puts every link the views build into the query string, aimed at this very
 * file. On GitHub Pages there is no server to answer `/demo/articles/read/2`,
 * so the context travels as `demo.html?view=…` instead.
 */
export function configureDemoRouting(basePath: string): void {
  configurePorts({
    routing: { mode: "query", param: "view", basePath },
    appName: "react-resource-view",
    description: "CRUD views for REST APIs — API Platform, Strapi, Supabase.",
  })
}

export const articlesResource = createViewResource<Article>("demo_articles", {
  name: "Articles",
  scope: "demo",
  view: {
    name: "Articles",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        published: { label: "Published", type: "checkbox" },
      },
    },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [
      tableViewOptionFactory({ columns: ["title", "author", "published"] }),
      cardViewOptionFactory({ grid: 3 }),
    ],
  },
  views: {
    [ActionList.list]: { name: "Articles" },
  },
})
