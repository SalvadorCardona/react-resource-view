import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "@/ports"
import { useScopeContext } from "@/scope/Scope"
import { MenuItemInterface, useIsActiveItemMenu } from "@/menu/menu"
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
  const [open, setOpen] = React.useState<boolean>(
    () => readOpenGroups()[item.name] ?? true
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    writeOpenGroups({ ...readOpenGroups(), [item.name]: nextOpen })
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton>
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
  const isActive = useIsActiveItemMenu()
  const children = item.items?.filter((subItem) => !subItem.hidden) ?? []
  const href = item.href ?? children[0]?.href ?? "/"

  return (
    <SidebarMenuButton
      isActive={children.some(isActive)}
      render={<Link to={href} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuButton>
  )
}

function NavLink({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveItemMenu()

  if (item.component) {
    const Component = item.component
    return <Component menuItem={item} />
  }

  return (
    <SidebarMenuButton
      isActive={isActive(item)}
      render={<Link to={item.href || "/"} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuButton>
  )
}

function NavSubLink({ item }: { item: MenuItemInterface }) {
  const isActive = useIsActiveItemMenu()

  if (item.component) {
    const Component = item.component
    return <Component menuItem={item} />
  }

  return (
    <SidebarMenuSubButton
      isActive={isActive(item)}
      render={<Link to={item.href || "/"} />}
    >
      {item.icon && <item.icon />}
      <span className="fc">{item.name}</span>
    </SidebarMenuSubButton>
  )
}
