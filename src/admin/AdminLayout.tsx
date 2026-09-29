import { FC, PropsWithChildren, ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/ui/sidebar"
import { AdminSidebarNav } from "@/admin/AdminSidebarNav"
import { AdminTopBar } from "@/admin/AdminTopBar"
import { AdminHeader } from "@/admin/AdminHeader"
import { AdminMobileNav } from "@/admin/AdminMobileNav"
import { useIsMobile } from "@/internal/browser/useIsMobile"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { isFullWidthView } from "@/utils/isFullWidthView"
import { cn } from "@/ui/cn"

export interface AdminLayoutProps extends PropsWithChildren {
  /** Rendered in the sidebar header on desktop, and in the top bar on mobile. */
  logo?: ReactNode
  /** Rendered at the end of the top bar — a search field, a user menu... */
  topBarEnd?: ReactNode
}

/**
 * Ready-made admin template: a collapsible sidebar built from the current
 * scope's `menu`, a top bar, a page header with sub-navigation tabs, and a
 * bottom navigation bar on narrow screens instead of the sidebar.
 *
 * Used as is, it needs nothing beyond a scope's `menu` and
 * `defaultViewResourceContextParams`:
 *
 * ```ts
 * const adminScope: ScopeInterface = {
 *   name: "admin",
 *   decoratorComponent: AdminLayout,
 *   menu: [createItemMenuWithResource({ resource: articlesResource })],
 * }
 * ```
 *
 * To add a logo or actions in the top bar, use {@link createAdminLayout}
 * instead of passing this component directly.
 *
 * Views are drawn in a column of constrained width; a view declaring
 * `fullWidth` — a board, a calendar — takes the whole page instead, keeping
 * the side margins.
 */
export function AdminLayout({ children, logo, topBarEnd }: AdminLayoutProps) {
  const isMobile = useIsMobile()
  const fullWidth = isFullWidthView(useCurrentViewResourceContext())

  return (
    <SidebarProvider>
      {!isMobile && <AdminSidebarNav logo={logo} />}
      <SidebarInset className="bg-muted/30">
        <AdminTopBar logo={logo} end={topBarEnd} />
        <div
          data-slot="admin-content"
          data-full-width={fullWidth || undefined}
          className={cn(
            "mx-auto flex w-full flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8",
            !fullWidth && "max-w-6xl",
            isMobile && "pb-24"
          )}
        >
          <AdminHeader />
          {children}
        </div>
      </SidebarInset>
      {isMobile && <AdminMobileNav />}
    </SidebarProvider>
  )
}

/**
 * Builds a `decoratorComponent` for a scope, with a logo and/or top bar
 * content baked in — `AdminLayout` itself takes no props when used directly
 * as `decoratorComponent`, since that slot only ever receives `children`.
 *
 * ```ts
 * decoratorComponent: createAdminLayout({ logo: <MyLogo />, topBarEnd: <UserMenu /> })
 * ```
 */
export function createAdminLayout(
  options: Omit<AdminLayoutProps, "children">
): FC<PropsWithChildren> {
  return function ConfiguredAdminLayout({ children }) {
    return <AdminLayout {...options}>{children}</AdminLayout>
  }
}
