import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Toaster } from "sonner"
import { Header } from "@/components/Header"

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
})

/**
 * The shell the playground shares between its two screens: the back office and
 * the builder that feeds it.
 *
 * There is no tab switcher here — `AdminLayout` already draws a full shell of
 * its own for the back office, and adding another bar above it would only
 * squeeze the space that template manages itself. The builder is reached from
 * `AdminLayout`'s top bar instead, and finds its own way back the same way.
 */
function PlaygroundLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <Toaster position="bottom-right" />
    </div>
  )
}
