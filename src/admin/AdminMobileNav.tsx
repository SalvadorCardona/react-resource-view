import { useState } from "react"
import { useNavigate } from "@/ports"
import { useScopeContext } from "@/scope/Scope"
import { MenuItemInterface, useIsActiveItemMenu } from "@/menu/menu"
import { Button } from "@/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer"
import { cn } from "@/ui/cn"

/**
 * Bottom navigation bar for narrow screens, where a permanent sidebar would
 * take too much of the viewport. A top-level entry with children opens a
 * drawer listing them instead of a nested menu.
 */
export function AdminMobileNav() {
  const scope = useScopeContext()?.scope
  const isActive = useIsActiveItemMenu()
  const navigate = useNavigate()
  const [openGroup, setOpenGroup] = useState<MenuItemInterface | null>(null)

  const items = (scope?.menu ?? []).filter((item) => !item.hidden)
  if (items.length === 0) return null

  const handleItemClick = (item: MenuItemInterface) => {
    const children = item.items?.filter((subItem) => !subItem.hidden) ?? []

    if (children.length > 0 && !item.subNavigation) {
      setOpenGroup(item)
      return
    }

    void navigate({ to: item.href ?? children[0]?.href ?? "/" })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
      <div className="flex items-center overflow-x-auto px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item) || (item.items?.some(isActive) ?? false)

          return (
            <Button
              key={item.name}
              variant="ghost"
              onClick={() => handleItemClick(item)}
              className={cn(
                "mx-1 flex min-w-16 flex-col items-center gap-0.5 rounded-lg p-3",
                active ? "text-primary" : "text-foreground"
              )}
            >
              {Icon && <Icon className="size-5" />}
              <span className="fc text-xs whitespace-nowrap">{item.name}</span>
            </Button>
          )
        })}
      </div>

      <Drawer
        open={!!openGroup}
        onOpenChange={(open) => !open && setOpenGroup(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {openGroup?.icon && <openGroup.icon className="size-5" />}
              {openGroup?.name}
            </DrawerTitle>
          </DrawerHeader>
          <div className="grid gap-3 overflow-y-auto p-4 pt-0">
            {openGroup?.items
              ?.filter((subItem) => !subItem.hidden)
              .map((subItem) => {
                const SubIcon = subItem.icon

                return (
                  <Button
                    key={subItem.name}
                    variant={isActive(subItem) ? "default" : "outline"}
                    onClick={() => {
                      setOpenGroup(null)
                      handleItemClick(subItem)
                    }}
                  >
                    {SubIcon && <SubIcon className="size-5 shrink-0" />}
                    <span className="fc font-medium">{subItem.name}</span>
                  </Button>
                )
              })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
