import { ClientOnly, createFileRoute, useRouterState } from "@tanstack/react-router"
import { parseLink, ResourceViewProvider } from "react-resource-view"

export const Route = createFileRoute("/playground/")({
  head: () => ({
    meta: [
      { title: "Playground — Resource & Form" },
      {
        name: "description",
        content:
          "A complete back office built from resource declarations and running on AdminLayout, react-resource-view's ready-made admin template: users and the CVs hanging off them, the accounts they belong to, a blog that is a page builder and a catalogue — tables, boards, cards and split views, every edit real, every screen a URL.",
      },
      // The context lives in the query string and every state is a different
      // URL; none of them is a page worth indexing on its own.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlaygroundRoute,
})

/**
 * The whole of both libraries, running as one application.
 *
 * An administration with six areas — the people who can sign in and the CVs
 * they assemble, the accounts they belong to, the blog and the pages it
 * publishes, the catalogue it sells — and not one screen written by hand: the lists and their layouts, the filter bars, the create and
 * edit forms, the delete confirmations and the tabs under a company all come
 * from the resource declarations in `src/demo/playground/resources`. The
 * navigation and the page heading around them are `AdminLayout`, which is what
 * the package calls an admin template.
 *
 * The view context is read back out of the URL with `parseLink`, so every
 * screen of the back office is a link that can be shared.
 */
function PlaygroundRoute() {
  return (
    <ClientOnly fallback={<PlaygroundSkeleton />}>
      <Playground />
    </ClientOnly>
  )
}

// One import() per area, which is the split point: the documentation pages,
// which embed their demos directly, never download the administration.
const SCOPES = {
  admin: () => import("@/demo/playground/adminScope").then((m) => m.adminScope),
}

function Playground() {
  // The query string alone, never the path: in query mode the whole context
  // lives in one parameter, and handing the pathname to `parseLink` would read
  // "playground" — or the repository prefix GitHub Pages serves the site under
  // — as the scope of a view.
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })
  const params = parseLink(searchStr)

  return (
    <ResourceViewProvider
      // A link naming a scope the playground does not declare — the old
      // `docs` area, shared or bookmarked before it was retired — opens the
      // back office where it starts, rather than failing to load that scope.
      viewResourceContextParams={
        params.scope && !(params.scope in SCOPES) ? undefined : params
      }
      configuration={{
        scopes: SCOPES,
        // A URL naming no scope opens the back office; each scope decides for
        // itself which of its resources that means.
        defaultScope: "admin",
        scopeFallback: <PlaygroundSkeleton />,
      }}
    />
  )
}

function PlaygroundSkeleton() {
  return (
    <div
      className="mx-auto max-w-[100rem] animate-pulse space-y-4 px-4 py-8 lg:px-8"
      aria-hidden
    >
      <div className="h-9 w-56 rounded-lg bg-muted" />
      <div className="h-64 w-full rounded-xl bg-muted" />
    </div>
  )
}
