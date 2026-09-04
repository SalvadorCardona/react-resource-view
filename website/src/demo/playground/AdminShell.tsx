import { lazy, Suspense, useState, type ReactNode } from "react"
import { Link as DocsLink } from "@tanstack/react-router"
import {
  Check,
  ChevronRight,
  Code2,
  Database,
  Link2,
  RotateCcw,
} from "lucide-react"
import { ActionList } from "react-data-form"
import {
  Link,
  useCurrentViewResourceContext,
  useLocation,
  useScopeContext,
  type MenuItemInterface,
} from "react-resource-view"
import { resetAdminData } from "@/demo/playground/adminData"
import { getDeclaration } from "@/demo/playground/declarations"
import { cn } from "@/lib/cn"

// The panel carries the syntax highlighter, which nothing else in the
// playground needs; it arrives when the reader asks for it.
const DeclarationPanel = lazy(() => import("@/demo/playground/DeclarationPanel"))

/**
 * The administration template the playground runs inside.
 *
 * A scope's `decoratorComponent` wraps every view of the area, which is what
 * turns a set of resources into an application: one navigation, one page
 * heading, one place where the chrome of the back office lives. The views
 * themselves are untouched — they are rendered as `children`.
 *
 * Nothing here is written per resource. The menu is the scope's own `menu`,
 * read through `useScopeContext`, and the heading comes from whichever view is
 * on screen: adding an eighth resource to the administration changes this
 * file not at all.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const scope = useScopeContext()?.scope
  const menu = scope?.menu?.filter((item) => !item.hidden) ?? []
  const isActive = useIsCurrent()

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="size-2 rounded-full bg-view" />
          {scope?.label ?? scope?.name}
        </p>

        <nav aria-label={scope?.label ?? scope?.name} className="space-y-1">
          {menu.map((item) => (
            <NavEntry key={item.name} item={item} isActive={isActive} />
          ))}
        </nav>

        <SidebarFooter />
      </aside>

      <main className="min-w-0">
        <PageHeading />
        {children}
      </main>
    </div>
  )
}

/** Reads whether an entry points at what is on screen. */
type IsActive = (item: MenuItemInterface) => boolean

/**
 * The same question `useIsActiveItemMenu` answers, asked of a decoded URL.
 *
 * That hook compares an entry's `href` with the current location, which is
 * right in path mode. This site keeps the whole context in one search
 * parameter instead, and the router hands that parameter back percent-encoded:
 * the comparison is then between `?view=admin%2Fadmin_users%2Flist` and the
 * `?view=admin/admin_users/list` the package built, and never matches.
 * Decoding first is the whole difference.
 */
function useIsCurrent(): IsActive {
  const { pathname, searchStr } = useLocation()
  const current = decodeURIComponent(pathname + searchStr)

  return (item) => Boolean(item.href) && current.startsWith(item.href!)
}

/** An entry of the menu: a link, or a group holding a few of them. */
function NavEntry({
  item,
  isActive,
}: {
  item: MenuItemInterface
  isActive: IsActive
}) {
  const children = item.items?.filter((entry) => !entry.hidden) ?? []

  if (children.length === 0) {
    return <NavLink item={item} isActive={isActive} />
  }

  return <NavGroup item={item} items={children} isActive={isActive} />
}

function NavGroup({
  item,
  items,
  isActive,
}: {
  item: MenuItemInterface
  items: MenuItemInterface[]
  isActive: IsActive
}) {
  const [open, setOpen] = useState(true)
  const Icon = item.icon

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {Icon && <Icon className="size-4 shrink-0 opacity-70" />}
        <span className="truncate">{item.name}</span>
        <ChevronRight
          className={cn("ml-auto size-3.5 transition-transform", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="ml-4 border-l border-border pl-2">
          {items.map((entry) => (
            <NavLink key={entry.name} item={entry} isActive={isActive} />
          ))}
        </div>
      )}
    </div>
  )
}

function NavLink({
  item,
  isActive,
}: {
  item: MenuItemInterface
  isActive: IsActive
}) {
  if (item.component) {
    const Component = item.component
    return <Component menuItem={item} />
  }

  const active = isActive(item)
  const Icon = item.icon

  return (
    <Link
      to={item.href ?? "/"}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-view-soft font-medium text-view"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {Icon && <Icon className={cn("size-4 shrink-0", !active && "opacity-70")} />}
      <span className="truncate">{item.name}</span>
    </Link>
  )
}

/**
 * Where the data lives, and the way back to the fixtures.
 *
 * The edits made here are kept across reloads — that is what makes the
 * playground read as an application — so a reader who has deleted half the
 * catalogue to see what happens needs a way to get it back.
 */
function SidebarFooter() {
  return (
    <div className="mt-6 space-y-3 border-t border-border pt-4 text-xs text-muted-foreground">
      <p className="flex items-start gap-2 px-3">
        <Database className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Stored in this browser. Every edit is real and survives a reload.{" "}
          <DocsLink
            to="/docs/resource-view/backends"
            className="font-medium text-view hover:underline"
          >
            Point it at your API
          </DocsLink>
        </span>
      </p>
      <button
        type="button"
        onClick={() => {
          resetAdminData()
          // The views fetched on mount; the plainest way to have every one of
          // them read the fixtures again is to start the page over.
          window.location.reload()
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-muted hover:text-foreground"
      >
        <RotateCcw className="size-3.5 shrink-0" />
        Reset the demo data
      </button>
    </div>
  )
}

/**
 * The title of the screen currently on show, and two things to do with it.
 *
 * The views render their own controls — the create button, the layout
 * switcher, the filter bar — but no page title: which one to write is a
 * decision about the shell, not about the list. It is read off the view, so an
 * edit form says "Edit a user" and the list it came from says "Users".
 *
 * Next to it, "Copy link" hands over the URL the reader is looking at —
 * layout, filters, page and open record included, which is the point — and
 * "Declaration" opens the file this screen came out of.
 */
function PageHeading() {
  const currentResource = useCurrentViewResourceContext()
  const view = currentResource?.view
  const [showCode, setShowCode] = useState(false)
  const declaration = getDeclaration(currentResource?.resourceId as string)

  if (!view?.name) return null

  // Every action inherits the resource's `view`, description included, so a
  // form would otherwise be introduced by the sentence written for its list.
  const description =
    currentResource.resourceAction === ActionList.list ? view.description : undefined

  return (
    <>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{view.name}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CopyLinkButton />
          {declaration && (
            <button
              type="button"
              onClick={() => setShowCode((current) => !current)}
              aria-pressed={showCode}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                showCode
                  ? "border-view/50 bg-view-soft text-view"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="size-3.5" />
              Declaration
              <span className="rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                {declaration.lines} lines
              </span>
            </button>
          )}
        </div>
      </header>

      {showCode && declaration && (
        <Suspense fallback={<DeclarationSkeleton />}>
          <DeclarationPanel declaration={declaration} />
        </Suspense>
      )}
    </>
  )
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      title="This screen is a URL: layout, filters, page and open record included."
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        })
      }}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
    >
      {copied ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Link2 className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy link"}
    </button>
  )
}

function DeclarationSkeleton() {
  return (
    <div className="mb-6 h-48 animate-pulse rounded-2xl bg-muted" aria-hidden />
  )
}
