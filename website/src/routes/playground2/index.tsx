import { ClientOnly, createFileRoute, useRouterState } from "@tanstack/react-router"
import { parseLink, ResourceViewProvider } from "react-resource-view"

export const Route = createFileRoute("/playground2/")({
  head: () => ({
    meta: [
      { title: "Playground2 — Resource & Form" },
      {
        name: "description",
        content:
          "A back office running on AdminLayout, react-resource-view's ready-made admin template: two resources, CMS and My profiles, filled by the page builder's page and résumé kits.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Playground2Route,
})

/**
 * playground2's back office: `AdminLayout` around two resources, rather than
 * `/playground`'s hand-written `AdminShell`.
 *
 * The same query-string routing as `/playground` — see that route for why the
 * search string alone, never the path, is handed to `parseLink`.
 */
function Playground2Route() {
  return (
    <ClientOnly fallback={<Playground2Skeleton />}>
      <Playground2 />
    </ClientOnly>
  )
}

function Playground2() {
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })

  return (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(searchStr)}
      configuration={{
        scopes: {
          playground2: () =>
            import("@/demo/playground2/scope").then((m) => m.playground2Scope),
        },
        defaultScope: "playground2",
        scopeFallback: <Playground2Skeleton />,
      }}
    />
  )
}

function Playground2Skeleton() {
  return (
    <div className="mx-auto max-w-[100rem] animate-pulse space-y-4 px-4 py-8 lg:px-8" aria-hidden>
      <div className="h-9 w-56 rounded-lg bg-muted" />
      <div className="h-64 w-full rounded-xl bg-muted" />
    </div>
  )
}
