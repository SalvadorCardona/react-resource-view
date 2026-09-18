import { ActionList } from "react-data-form"
import { Link } from "@/ports"
import { useScopeContext } from "@/scope/Scope"
import { useIsActiveItemMenu } from "@/menu/menu"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { Button } from "@/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"
import { cn } from "@/ui/cn"
import { ArrowLeft } from "lucide-react"

/**
 * Page header of the admin layout: a title for every view but the list (which
 * writes its own, via `ListHeader`), a back button on a sub-resource, and —
 * when the current page belongs to a menu entry marked `subNavigation` — the
 * tabs to its sibling pages.
 */
export function AdminHeader() {
  const currentResource = useCurrentViewResourceContext()
  const action = currentResource.resourceAction
  const baseView = currentResource.resource?.views?.[action]
  const titleIsWrittenByTheView = action === ActionList.list

  if (currentResource.view.components?.navigation) {
    const Navigation = currentResource.view.components.navigation
    return (
      <>
        <Navigation />
        <SubNavigation />
      </>
    )
  }

  const rowIsEmpty = titleIsWrittenByTheView && !currentResource.parentResource

  return (
    <header className={cn("w-full", !titleIsWrittenByTheView && "mb-5")}>
      {!rowIsEmpty && (
        <div className="flex items-center gap-4">
          {currentResource.parentResource && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <ArrowLeft />
            </Button>
          )}

          {!titleIsWrittenByTheView && (
            <h2 className="fc text-2xl font-semibold tracking-tight">
              {baseView && baseView.name}
            </h2>
          )}
        </div>
      )}

      <SubNavigation />
    </header>
  )
}

function SubNavigation() {
  const menu = useScopeContext()?.scope?.menu ?? []
  const isActive = useIsActiveItemMenu()

  const parent = menu.find((item) => item.items?.some(isActive))

  if (!parent?.subNavigation) return null

  const items = parent.items?.filter((item) => !item.hidden) ?? []
  if (items.length === 0) return null

  const activeValue = items.find(isActive)?.href ?? items[0]?.href

  return (
    <Tabs value={activeValue} className="mb-5">
      <TabsList variant="default">
        {items.map((item) => (
          <TabsTrigger
            key={item.name}
            value={item.href ?? item.name}
            render={
              <Link to={item.href || "/"}>
                {item.icon && <item.icon />}
                {item.name}
              </Link>
            }
          />
        ))}
      </TabsList>
    </Tabs>
  )
}
