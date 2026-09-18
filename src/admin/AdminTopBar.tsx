import { ReactNode } from "react"
import { SidebarTrigger } from "@/ui/sidebar"
import { useIsMobile } from "@/internal/browser/useIsMobile"

/**
 * Top bar of the admin layout: the sidebar toggle (or the logo, in mobile,
 * where the sidebar is a drawer instead), and whatever the host application
 * wants at the other end — a search field, notifications, a user menu.
 */
export function AdminTopBar({ logo, end }: { logo?: ReactNode; end?: ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      {isMobile ? logo : <SidebarTrigger className="-ml-1" />}
      {end && <div className="ml-auto flex items-center gap-1">{end}</div>}
    </header>
  )
}
