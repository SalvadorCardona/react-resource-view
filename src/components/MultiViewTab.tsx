import { FC } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Trans } from "react-mini-i18n"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import { useNavigate } from "@/ports"
import { encodeIri, generateLink } from "@/routes/routes"
import { findResource } from "@/utils/findResource"
import { ActionList } from "react-data-form"
import { IconType, SubViewResourceInterface } from "@/ViewInterface"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { ScrollArea } from "@/ui/scroll-area"
import { cn } from "@/ui/cn"
import { useMediaQuery } from "@/internal/browser/useMediaQuery"

interface ResolvedSubView {
  slug: string
  name: string
  description?: string
  icon?: IconType
  viewComponent?: FC
  /** Set when the sub-view points at a resource. */
  viewResourceParams?: ViewResourceContextParams
}

/**
 * Normalises one entry of subViewResource.list: resolves the resource, from
 * either `resource` or `resourceId`, derives its slug, name and icon, and
 * prepares the params of
 * a nested ViewResourceContextProvider.
 */
function resolveSubView(
  subView: SubViewResourceInterface
): ResolvedSubView | undefined {
  const { slug, name, description, icon, viewComponent, ...viewResourceParams } =
    subView

  const resource = findResource(viewResourceParams)
  const currentSlug = slug ?? (resource ? encodeIri(resource["@id"]) : undefined)

  if (!currentSlug) {
    console.warn(
      "SubViewResource skipped: neither a slug nor a resolvable resource",
      subView
    )
    return undefined
  }

  return {
    slug: currentSlug,
    name: name ?? resource?.name ?? currentSlug,
    description,
    icon: icon ?? resource?.icon,
    viewComponent,
    viewResourceParams: resource
      ? {
          ...viewResourceParams,
          resource,
          resourceAction: viewResourceParams.resourceAction ?? ActionList.list,
        }
      : undefined,
  }
}

export function MultiViewTab() {
  const currentResource = useCurrentViewResourceContext()
  const navigate = useNavigate()
  // A menu down the side is a desktop shape: on a phone the column would eat
  // the width the sub-view itself needs, so the bar comes back there — and it
  // scrolls sideways rather than wrapping onto three lines.
  const isWideScreen = useMediaQuery("(min-width: 768px)")
  const subViews = currentResource.view?.subViewResource
  const orientation =
    subViews?.orientation === "vertical" && isWideScreen ? "vertical" : "horizontal"
  const subViewList = (subViews?.list ?? [])
    .map(resolveSubView)
    .filter((subView): subView is ResolvedSubView => subView !== undefined)

  if (!subViews || subViewList.length === 0) {
    return null
  }

  // Sub-views derive their filters from the parent item through
  // onInitViewResource, so they wait for it to load before mounting.
  if (currentResource.id && !currentResource.data) {
    return null
  }

  const page =
    subViewList.find((subView) => subView.slug === currentResource.subResource)
      ?.slug ?? subViewList[0].slug

  function goToNextPage(subResource: string) {
    const link = generateLink({
      id: currentResource.id,
      resourceAction: currentResource.resourceAction,
      resourceId: currentResource.resource["@id"],
      scope: currentResource.scope,
      subResource,
    })
    const currentScrollY = window.scrollY
    currentResource.setViewResource((current) => ({
      ...current,
      subResource: subResource,
    }))
    // The navigate port may resolve synchronously depending on the router.
    void Promise.resolve(
      navigate({ to: link, replace: true, resetScroll: false })
    ).then(() => {
      // Keep the reading position instead of jumping to the top
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY, behavior: "instant" })
      })
    })
  }

  const triggers = subViewList.map((subView) => (
    <TabsTrigger
      key={subView.slug + "-tabs"}
      value={subView.slug}
      className={cn(
        `shrink-0
         min-w-max
         h-9 md:h-10
         px-3 md:px-4
         rounded-md
         bg-muted
         data-[state=active]:shadow data-[state=active]:text-accent-foreground
         hover:bg-accent/60
         transition-colors
         flex items-center gap-2`,
        // Down a column a tab is a menu entry: the whole width, and the
        // labels lined up under one another rather than each centred.
        orientation === "vertical" && "w-full justify-start"
      )}
      aria-label={subView.name}
      title={subView.name}
    >
      {subView.icon && <subView.icon className="h-4 w-4 shrink-0" />}
      <span>
        <Trans className="fc">{subView.name}</Trans>
      </span>
    </TabsTrigger>
  ))

  return (
    // Layout responsive: mobile = pile (leftCol puis tabs), desktop = 2 colonnes si leftCol existe
    <div
      className={
        "flex flex-col md:grid md:gap-6 " +
        (subViews.viewComponent ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-1")
      }
    >
      {subViews.viewComponent && (
        <aside
          className="
            w-full
            md:sticky md:top-20 md:self-start md:h-[calc(100vh-6rem)] md:overflow-auto
            mb-4 md:mb-0
          "
        >
          <subViews.viewComponent />
        </aside>
      )}
      <Tabs
        value={page}
        onValueChange={(newPage) => goToNextPage(newPage)}
        orientation={orientation}
        className={
          orientation === "vertical"
            ? "w-full flex flex-row items-start gap-6"
            : "w-full flex flex-col"
        }
      >
        {orientation === "vertical" ? (
          // The menu keeps its own column and follows the reader down a long
          // sub-view, exactly as the left column of the page does.
          <TabsList
            aria-label="Sous-vues"
            className="
              sticky top-20 self-start
              w-56 shrink-0
              border-none rounded-xl
              flex flex-col items-stretch justify-start
              gap-1
              h-auto
            "
          >
            {triggers}
          </TabsList>
        ) : (
          // The bar stays one line and scrolls sideways rather than wrapping:
          // a record with eight sub-views used to push its content down by
          // three rows of buttons on a phone, and the labels were cut to
          // twelve characters to limit the damage.
          <ScrollArea
            orientation="horizontal"
            className="
              sticky top-16 z-30
              bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60
            "
          >
            <TabsList
              aria-label="Sous-vues"
              className="
                w-max min-w-full
                border-none md:border
                gap-1 md:gap-2
                flex-nowrap flex
                h-auto
              "
            >
              {triggers}
            </TabsList>
          </ScrollArea>
        )}
        {subViewList.map((subView) => (
          <TabsContent
            value={subView.slug}
            key={subView.slug + "-content"}
            className={orientation === "vertical" ? "min-w-0" : "mt-4"}
          >
            <CardHeader className="rounded-md p-4 bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                {subView.icon && <subView.icon className="h-4 w-4 md:h-5 md:w-5" />}
                <Trans>{subView.name}</Trans>
              </CardTitle>
              {subView.description && (
                <CardDescription className="text-sm md:text-base">
                  <Trans>{subView.description}</Trans>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="mt-4 md:mt-6 p-0 md:p-2">
              {subView.viewComponent ? (
                <subView.viewComponent />
              ) : (
                subView.viewResourceParams && (
                  <ViewResourceContextProvider
                    // Remonter la sous-vue quand l'item parent change pour
                    // re-evaluate onInitViewResource, whose filters come from the parent
                    key={subView.slug + "-" + (currentResource.id ?? "")}
                    {...subView.viewResourceParams}
                  />
                )
              )}
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
