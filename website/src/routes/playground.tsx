import { createFileRoute, useRouterState } from "@tanstack/react-router"
import { ClientOnly } from "@tanstack/react-router"
import { ActionList } from "react-data-form"
import { parseLink, ResourceViewProvider } from "react-resource-view"
import { Toaster } from "sonner"
import { Header } from "@/components/Header"
import { seedDemoData } from "@/demo/data"
import { articlesResource, sessionsResource } from "@/demo/resources"

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground — Resource & Form" },
      {
        name: "description",
        content:
          "A complete application built from two resource declarations: list, detail, create, edit and delete, all driven by the URL.",
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
 * Everything below comes from the two resource declarations in
 * `src/demo/resources.ts`: the list and its layouts, the filter bar, the create
 * and edit forms, the delete confirmation. There is no screen written by hand.
 *
 * The view context is read back out of the URL with `parseLink`, so a link
 * copied from a documentation demo lands here on the same item.
 */
function PlaygroundRoute() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[100rem] px-4 py-8 lg:px-8">
        <ClientOnly fallback={<PlaygroundSkeleton />}>
          <Playground />
        </ClientOnly>
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}

function Playground() {
  const location = useRouterState({ select: (state) => state.location })
  seedDemoData()

  const params = parseLink(location.pathname + location.searchStr)

  return (
    <ResourceViewProvider
      viewResourceContextParams={{
        resourceId: articlesResource["@id"] as string,
        resourceAction: ActionList.list,
        ...params,
        scope: "docs",
      }}
      configuration={{
        resources: [articlesResource, sessionsResource],
        defaultScope: "docs",
      }}
    />
  )
}

function PlaygroundSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-9 w-56 rounded-lg bg-muted" />
      <div className="h-64 w-full rounded-xl bg-muted" />
    </div>
  )
}
