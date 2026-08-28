import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
})

/**
 * The shell shared by every documentation page: the header, the split sidebar,
 * and the page itself.
 *
 * The sidebar is rendered once here rather than per page, so navigating between
 * pages neither remounts it nor loses its scroll position.
 */
function DocsLayout() {
  return (
    <div className="min-h-screen">
      <Header showMenu />

      <div className="mx-auto flex max-w-[100rem] px-0 lg:px-6">
        <aside className="hidden w-[17rem] shrink-0 lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-4">
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1 border-l border-border/60">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
