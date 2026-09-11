import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { Blocks, LayoutDashboard } from "lucide-react"
import { Toaster } from "sonner"
import { Header } from "@/components/Header"

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
})

/**
 * The shell the two playgrounds share.
 *
 * There are two because the libraries answer two different questions, and only
 * one of them is a CRUD screen: the back office is a set of resources, the
 * builder is a single form whose shape the reader decides. The switcher is
 * here rather than inside either of them so neither remounts when the reader
 * crosses over.
 */
function PlaygroundLayout() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-[100rem] px-4 py-8 lg:px-8">
        <nav className="mb-6 flex w-fit items-center gap-0.5 rounded-xl bg-muted/60 p-0.5">
          <Tab to="/playground" icon={LayoutDashboard}>
            Back office
          </Tab>
          <Tab to="/playground/builder" icon={Blocks}>
            Page builder
          </Tab>
        </nav>

        <Outlet />
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}

function Tab({
  to,
  icon: Icon,
  children,
}: {
  to: "/playground" | "/playground/builder"
  icon: typeof Blocks
  children: string
}) {
  return (
    <Link
      to={to}
      // The back office keeps its context in the query string, and every one of
      // its screens is still that tab: matching on the path alone is what keeps
      // the switcher lit while the reader moves around inside it.
      activeOptions={{ exact: true, includeSearch: false }}
      className="flex items-center gap-2 rounded-[0.65rem] px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      activeProps={{ className: "bg-background text-foreground shadow-sm" }}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  )
}
