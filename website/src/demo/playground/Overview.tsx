import type { ReactNode } from "react"
import { Link as DocsLink } from "@tanstack/react-router"
import {
  ArrowRight,
  Database,
  Link2,
  PencilOff,
  type LucideIcon,
} from "lucide-react"
import { ActionList } from "react-data-form"
import {
  generateLinkByResource,
  Link,
  type FilterInterface,
  type ViewResourceInterface,
} from "react-resource-view"
import {
  COMMENTS_ID,
  ORDERS_ID,
  POSTS_ID,
  PRODUCTS_ID,
  readAdminRows,
  ROASTS_ID,
  USERS_ID,
  type Comment,
  type Order,
  type Post,
  type Product,
  type Roast,
  type User,
} from "@/demo/playground/adminData"
import { formatPrice } from "@/demo/playground/adminRows"
import { getDeclaration } from "@/demo/playground/declarations"
import { commentsResource } from "@/demo/playground/resources/comments"
import { ordersResource } from "@/demo/playground/resources/orders"
import { postsResource } from "@/demo/playground/resources/posts"
import { productsResource } from "@/demo/playground/resources/products"
import { roastsResource } from "@/demo/playground/resources/roasts"
import { usersResource } from "@/demo/playground/resources/users"
import { cn } from "@/lib/cn"

/**
 * The screen the back office opens on: what needs doing, and what this is.
 *
 * It is the one screen of the playground that is not a list, and it exists to
 * make the lists worth opening. Every figure is read from the same storage the
 * lists write to — moderate a comment and the count drops — and every figure
 * is a link that lands on the list already filtered: the URL carries the
 * filter, the filter bar reads it back, and nothing in between is written
 * here.
 *
 * The second half is the pitch, stated in numbers the reader can check: each
 * of the six areas is one file, and the button on each of them shows it.
 */
export function Overview() {
  return (
    <div className="space-y-10">
      <Figures />
      <Resources />
      <UnderTheHood />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

interface Figure {
  value: string
  label: string
  hint: string
  href: string
  /** Something waiting on the reader, rather than a count of things. */
  attention?: boolean
}

/**
 * What the collections say right now.
 *
 * Read on render rather than through the list hook on purpose: this screen is
 * not a list of any resource, and six of them at once would be six fetches
 * for six numbers. The storage the repositories write to is a synchronous read
 * away, and the screen is remounted on every navigation back to it.
 */
function readFigures(): Figure[] {
  const users = readAdminRows<User>(USERS_ID)
  const posts = readAdminRows<Post>(POSTS_ID)
  const comments = readAdminRows<Comment>(COMMENTS_ID)
  const products = readAdminRows<Product>(PRODUCTS_ID)
  const orders = readAdminRows<Order>(ORDERS_ID)
  const roasts = readAdminRows<Roast>(ROASTS_ID)

  const pendingComments = comments.filter((row) => row.status === "pending")
  const toShip = orders.filter((row) => row.status === "paid")
  const revenue = orders
    .filter((row) => row.status === "paid" || row.status === "shipped")
    .reduce((sum, row) => sum + (row.total ?? 0), 0)
  const outOfStock = products.filter(
    (row) => row.status === "active" && (row.stock ?? 0) === 0
  )
  const drafts = posts.filter((row) => row.status === "draft")
  const published = posts.filter((row) => row.status === "published")
  const toRoast = roasts.filter(
    (row) => row.status === "planned" || row.status === "roasting"
  )
  const kilograms = toRoast.reduce((sum, row) => sum + (row.weight ?? 0), 0)
  const invited = users.filter((row) => row.status === "invited")
  const active = users.filter((row) => row.status === "active")

  return [
    {
      value: String(pendingComments.length),
      label: plural(pendingComments.length, "comment", "comments") + " to moderate",
      hint: `${comments.length} left under the posts in all`,
      href: listLink(commentsResource, { status: "pending" }, "list"),
      attention: pendingComments.length > 0,
    },
    {
      value: String(toShip.length),
      label: plural(toShip.length, "order", "orders") + " to ship",
      hint: `${formatPrice(revenue)} taken so far`,
      href: listLink(ordersResource, { status: "paid" }),
      attention: toShip.length > 0,
    },
    {
      value: String(outOfStock.length),
      label: plural(outOfStock.length, "product", "products") + " out of stock",
      hint: `${products.filter((row) => row.status === "active").length} on sale`,
      href: listLink(productsResource),
      attention: outOfStock.length > 0,
    },
    {
      value: String(drafts.length),
      label: plural(drafts.length, "post", "posts") + " in draft",
      hint: `${published.length} published — open the board to move one`,
      href: listLink(postsResource, undefined, "board"),
    },
    {
      value: `${kilograms} kg`,
      label: "to roast this week",
      hint: `${toRoast.length} ${plural(toRoast.length, "batch", "batches")} on the calendar`,
      href: listLink(roastsResource, undefined, "calendar"),
    },
    {
      value: String(invited.length),
      label: plural(invited.length, "invitation", "invitations") + " pending",
      hint: `${active.length} active ${plural(active.length, "account", "accounts")}`,
      href: listLink(usersResource, { status: "invited" }),
    },
  ]
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/**
 * A link into a list, with its filter and its layout in the URL — the same
 * call the views make for themselves.
 */
function listLink(
  resource: ViewResourceInterface,
  filter?: FilterInterface,
  viewVariantId?: string
): string {
  return generateLinkByResource({
    resource,
    resourceAction: ActionList.list,
    filter,
    viewVariantId,
  })
}

function Figures() {
  const figures = readFigures()

  return (
    <section aria-label="Today">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {figures.map((figure) => (
          <Link
            key={figure.label}
            to={figure.href}
            className={cn(
              "group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-view/50 hover:shadow-lg",
              figure.attention && "border-form/40"
            )}
          >
            <span className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {figure.value}
              </span>
              <span className="text-sm font-medium">{figure.label}</span>
              {figure.attention && (
                <span
                  className="ml-auto size-2 rounded-full bg-form"
                  aria-label="Needs attention"
                />
              )}
            </span>
            <span className="mt-1.5 text-xs text-muted-foreground">
              {figure.hint}
            </span>
            <span className="mt-3 flex items-center gap-1 text-xs font-medium text-view opacity-0 transition group-hover:opacity-100">
              Open, filtered
              <ArrowRight className="size-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const RESOURCES: ViewResourceInterface[] = [
  usersResource,
  postsResource,
  commentsResource,
  productsResource,
  ordersResource,
  roastsResource,
]

function Resources() {
  const totalLines = RESOURCES.reduce(
    (sum, resource) => sum + (getDeclaration(resource["@id"])?.lines ?? 0),
    0
  )

  return (
    <section aria-labelledby="overview-resources">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="overview-resources"
            className="text-lg font-semibold tracking-tight"
          >
            Six areas, six files
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No screen here is written by hand. Each area is one resource
            declaration — {totalLines} lines for the six of them — and the
            table, the filters, the forms, the dialogs and the menu entry come
            out of it. Open one and press <em>Declaration</em> to read the file
            next to what it renders.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon
          const declaration = getDeclaration(resource["@id"])
          // Each variant is named in the declaration, and that name is what
          // the layout switcher shows — so it is what is listed here too.
          const layouts = (resource.view?.viewVariants ?? [])
            .map((variant) => variant.name)
            .filter((name): name is string => Boolean(name))

          return (
            <Link
              key={resource["@id"]}
              to={listLink(resource)}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-view/50 hover:shadow-lg"
            >
              <span className="flex items-center gap-3">
                {Icon && (
                  <span className="flex size-9 items-center justify-center rounded-xl bg-view-soft text-view">
                    <Icon className="size-4" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-medium">{resource.view?.name}</span>
                  {declaration && (
                    <span className="block font-mono text-[11px] text-muted-foreground">
                      {declaration.file} · {declaration.lines} lines
                    </span>
                  )}
                </span>
              </span>

              <span className="text-sm text-muted-foreground">
                {resource.view?.description}
              </span>

              <span className="mt-auto flex flex-wrap gap-1.5">
                {layouts.map((layout) => (
                  <span
                    key={layout}
                    className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {layout}
                  </span>
                ))}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

interface Explanation {
  icon: LucideIcon
  title: string
  body: ReactNode
  code?: string
  href: "/docs/resource-view/backends" | "/docs/resource-view/routing" | "/docs/resource-view/scopes"
  cta: string
}

const EXPLANATIONS: Explanation[] = [
  {
    icon: Database,
    title: "Running on your browser's storage",
    body: (
      <>
        None of these resources declares a <code>path</code>, so each one falls
        back to a localStorage repository: every edit you make here is real,
        and survives a reload. Give a resource a path and the application a
        dialect, and the same screens talk to your API.
      </>
    ),
    code: `configureApi({ baseUrl, dialect: strapiDialect() })`,
    href: "/docs/resource-view/backends",
    cta: "API Platform, Strapi, Supabase",
  },
  {
    icon: Link2,
    title: "The URL is the state",
    body: (
      <>
        The layout, the filters, the page and the open record all live in the
        address bar. Change any of them and look at it; copy it and send it;
        reload and land on the same screen. <em>Copy link</em>, above every
        list, is a shortcut to that.
      </>
    ),
    href: "/docs/resource-view/routing",
    cta: "How routing works",
  },
  {
    icon: PencilOff,
    title: "No screen written by hand",
    body: (
      <>
        The menu on the left is read from the scope, the headings from the
        views, the forms and dialogs from the declarations. The only component
        this back office wrote itself is the shell around them — and it does
        not change when a seventh resource is added.
      </>
    ),
    href: "/docs/resource-view/scopes",
    cta: "Scopes and templates",
  },
]

function UnderTheHood() {
  return (
    <section aria-labelledby="overview-hood">
      <h2 id="overview-hood" className="mb-4 text-lg font-semibold tracking-tight">
        Under the hood
      </h2>

      <div className="grid gap-3 lg:grid-cols-3">
        {EXPLANATIONS.map(({ icon: Icon, title, body, code, href, cta }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5"
          >
            <span className="flex items-center gap-2 font-medium">
              <Icon className="size-4 text-view" />
              {title}
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground">
              {body}
            </p>
            {code && (
              <pre className="overflow-x-auto rounded-lg border border-border bg-code-bg px-3 py-2 font-mono text-[12px] text-foreground">
                {code}
              </pre>
            )}
            <DocsLink
              to={href}
              className="mt-auto flex items-center gap-1 text-sm font-medium text-view hover:underline"
            >
              {cta}
              <ArrowRight className="size-3.5" />
            </DocsLink>
          </div>
        ))}
      </div>
    </section>
  )
}
