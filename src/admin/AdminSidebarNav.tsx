import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "@/ports"
import { useScopeContext } from "@/scope/Scope"
import { MenuItemInterface } from "@/menu/menu"
import { useIsActiveMenuEntry } from "@/admin/useIsActiveMenuEntry"
import { cn } from "@/ui/cn"
import { ScrollArea } from "@/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/ui/sidebar"

const OPEN_GROUPS_STORAGE_KEY = "react-resource-view:admin-sidebar-open-groups"

function readOpenGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(OPEN_GROUPS_STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function writeOpenGroups(groups: Record<string, boolean>) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(OPEN_GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // Storage disabled or full: the menu just forgets which groups were open.
  }
}

/**
 * The desktop sidebar of a ready-made admin layout: the scope's `menu`
 * rendered as a two-level navigation, with sub-groups collapsible and their
 * open state remembered across reloads.
 *
 * Nothing here is specific to a project — swap it out entirely by passing a
 * different `decoratorComponent` to a scope if this shape doesn't fit.
 */
export function AdminSidebarNav({ logo }: { logo?: React.ReactNode }) {
  const scope = useScopeContext()?.scope
  const items = (scope?.menu ?? []).filter((item) => !item.hidden)

  return (
    <Sidebar>
      {logo && (
        <SidebarHeader className="h-16 justify-center px-4">{logo}</SidebarHeader>
      )}
      <SidebarContent>
        <SidebarGroup>
          <ScrollArea className="min-h-0 flex-1">
            <SidebarMenu>
              {items.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

function NavItem({ item }: { item: MenuItemInterface }) {
  const hasChildren = !!item.items && item.items.length > 0

  // A group with sub-navigation opens on its first page; the header shows the
  // sibling pages as tabs (see AdminHeader), so the sidebar only needs one
  // link for the whole group.
  if (hasChildren && item.subNavigation) {
    return (
      <SidebarMenuItem>
        <GroupLink item={item} />
      </SidebarMenuItem>
    )
  }

  if (hasChildren) {
    return <NavItemWithChildren item={item} />
  }

  return (
    <SidebarMenuItem>
      <NavLink item={item} />
    </SidebarMenuItem>
  )
}

function NavItemWithChildren({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveMenuEntry()
  const hasActiveChild = item.items?.some(isActive) ?? false
  const [open, setOpen] = React.useState<boolean>(
    () => hasActiveChild || (readOpenGroups()[item.name] ?? true)
  )

  // Reaching one of its pages — a click, the back button, a link from inside a
  // view — unfolds the group even if the reader had folded it: the entry lit
  // for the page on screen must be in sight. Adjusted during render rather
  // than in an effect, so the group never paints folded first.
  const [hadActiveChild, setHadActiveChild] = React.useState(hasActiveChild)
  if (hasActiveChild !== hadActiveChild) {
    setHadActiveChild(hasActiveChild)
    if (hasActiveChild) setOpen(true)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    writeOpenGroups({ ...readOpenGroups(), [item.name]: nextOpen })
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            // Marked more quietly than the page itself: the accent colour and
            // a heavier weight, no background, so the sub-entry stays the one
            // that reads as selected.
            <SidebarMenuButton
              data-active-child={hasActiveChild || undefined}
              className={cn(hasActiveChild && "font-semibold text-primary")}
            >
              {item.icon && <item.icon />}
              <span className="fc">{item.name}</span>
              <ChevronRight
                className={cn(
                  "ml-auto transition-transform duration-200",
                  open && "rotate-90"
                )}
              />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items
              ?.filter((subItem) => !subItem.hidden)
              .map((subItem) => (
                <SidebarMenuSubItem key={subItem.name}>
                  <NavSubLink item={subItem} />
                </SidebarMenuSubItem>
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function GroupLink({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveMenuEntry()
  const children = item.items?.filter((subItem) => !subItem.hidden) ?? []
  const href = item.href ?? children[0]?.href ?? "/"
  const active = children.some(isActive)

  return (
    <SidebarMenuButton
      isActive={active}
      aria-current={active ? "page" : undefined}
      render={<Link to={href} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuButton>
  )
}

function NavLink({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveMenuEntry()

  if (item.component) {
    const Component = item.component
    return <Component menuItem={item} />
  }

  const active = isActive(item)

  return (
    <SidebarMenuButton
      isActive={active}
      aria-current={active ? "page" : undefined}
      render={<Link to={item.href || "/"} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuButton>
  )
}

function NavSubLink({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveMenuEntry()

  if (item.component) {
    const Component = item.component
    return <Component menuItem={item} />
  }

  const active = isActive(item)

  return (
    <SidebarMenuSubButton
      isActive={active}
      aria-current={active ? "page" : undefined}
      render={<Link to={item.href || "/"} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuSubButton>
  )
}
