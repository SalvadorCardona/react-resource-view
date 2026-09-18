import { ClientOnly, createFileRoute, useRouterState } from "@tanstack/react-router"
import { parseLink, ResourceViewProvider } from "react-resource-view"

export const Route = createFileRoute("/playground/")({
  head: () => ({
    meta: [
      { title: "Playground — Resource & Form" },
      {
        name: "description",
        content:
          "A complete back office built from resource declarations and running on AdminLayout, react-resource-view's ready-made admin template: users and the CVs hanging off them, the accounts they belong to, a blog that is a page builder, a catalogue and a roasting schedule — tables, boards, split views, calendars and timelines, every edit real, every screen a URL.",
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
 * publishes, the catalogue it sells, the roasters it runs — and not one screen
 * written by hand: the lists and their layouts, the filter bars, the create and
 * edit forms, the delete confirmations and the tabs under a company all come
 * from the resource declarations in `src/demo/playground/resources`. The
 * navigation and the page heading around them are `AdminLayout`, which is what
 * the package calls an admin template.
 *
 * The view context is read back out of the URL with `parseLink`, so a link
 * copied from a documentation demo lands here on the same item.
 */
function PlaygroundRoute() {
  return (
    <ClientOnly fallback={<PlaygroundSkeleton />}>
      <Playground />
    </ClientOnly>
  )
}

function Playground() {
  // The query string alone, never the path: in query mode the whole context
  // lives in one parameter, and handing the pathname to `parseLink` would read
  // "playground" — or the repository prefix GitHub Pages serves the site under
  // — as the scope of a view.
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })

  return (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(searchStr)}
      configuration={{
        // One import() per area, which is the split point: opening the
        // playground downloads the administration, following a link from a
        // documentation page downloads the demos, and neither pays for the
        // other.
        scopes: {
          admin: () =>
            import("@/demo/playground/adminScope").then((m) => m.adminScope),
          docs: () => import("@/demo/playground/docsScope").then((m) => m.docsScope),
        },
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
