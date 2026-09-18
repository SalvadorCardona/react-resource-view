import { Link as RouterLink } from "@tanstack/react-router"
import { ArrowRight, Blocks, Building2 } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  generateLink,
  generateLinkByResource,
  Link,
  type FilterInterface,
  type ViewResourceInterface,
} from "react-resource-view"
import { formatPrice } from "@/demo/playground/adminRows"
import {
  COMMENTS_ID,
  COMPANIES_ID,
  ORDERS_ID,
  POSTS_ID,
  PRODUCTS_ID,
  readAdminRows,
  ROASTS_ID,
  USERS_ID,
  type Comment,
  type Company,
  type Order,
  type Post,
  type Product,
  type Roast,
  type User,
} from "@/demo/playground/adminData"
import { commentsResource } from "@/demo/playground/resources/comments"
import { companiesResource } from "@/demo/playground/resources/companies"
import { ordersResource } from "@/demo/playground/resources/orders"
import { postsResource } from "@/demo/playground/resources/posts"
import { productsResource } from "@/demo/playground/resources/products"
import { roastsResource } from "@/demo/playground/resources/roasts"
import { usersResource } from "@/demo/playground/resources/users"
import { cn } from "@/lib/cn"

/**
 * The screen the back office opens on: what needs doing, and what is behind it.
 *
 * The one screen of the back office that is not a list, and it exists to make
 * the lists worth opening. Every figure is read from the same storage the lists
 * write to — moderate a comment and the count drops — and every figure is a
 * link landing on the list already filtered: the URL carries the filter, the
 * filter bar reads it back, and nothing in between is written here.
 */
export function Overview() {
  return (
    <div className="space-y-10">
      <Figures />
      <BlockRecords />
      <CompanyTabs />
      <Resources />
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
 * not a list of any resource, and eight of them at once would be eight fetches
 * for eight numbers. The storage the repositories write to is a synchronous
 * read away, and the screen is remounted on every navigation back to it.
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
 * A link into a list, with its filter and its layout in the URL — the same call
 * the views make for themselves.
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

/**
 * The half of this back office that is not a form of six fields: the records
 * assembled block by block, and the builder that assembles them.
 *
 * The builder is a route of its own rather than a view of the scope — it is one
 * form, not a CRUD screen — so this is a plain router link, like the one in the
 * top bar.
 */
function BlockRecords() {
  const posts = readAdminRows<Post>(POSTS_ID)
  const pages = posts.filter((row) => row.category === "Pages")
  // One account, one CV: the count of the CVs is the count of the accounts.
  const resumes = readAdminRows<User>(USERS_ID)

  return (
    <section aria-labelledby="overview-blocks">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-form-soft text-form">
          <Blocks className="size-4" />
        </span>

        <div className="min-w-0">
          <h2 id="overview-blocks" className="font-semibold tracking-tight">
            {posts.length} {plural(posts.length, "post", "posts")} and{" "}
            {resumes.length} {plural(resumes.length, "CV", "CVs")}, assembled
            block by block
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A post is not six fields but an array of blocks, each one a form of
            its own — {pages.length} of them are the pages of the site rather
            than articles, in the same collection because they are the same
            record. A CV works the same way, and is a field of the account
            itself: one account, one CV. Open a post and you are in the builder;
            the demo beside it publishes into these very collections.
          </p>
        </div>

        <RouterLink
          to="/playground/builder"
          className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-form/50 bg-form-soft px-3 py-1.5 text-sm font-medium text-form transition hover:-translate-y-0.5 sm:self-auto"
        >
          Open the builder demo
          <ArrowRight className="size-3.5" />
        </RouterLink>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * The way into the one screen of the back office that is neither a list nor a
 * form on its own: a company, and the collections hanging off it.
 *
 * A link rather than a paragraph, because the shape only reads as an answer
 * once it is on screen. The tab is a segment of the URL like the rest of the
 * context, so this lands on a company's team rather than on a company.
 */
function CompanyTabs() {
  const company = readAdminRows<Company>(COMPANIES_ID).find(
    (row) => row.status === "customer"
  )

  if (!company) return null

  const href = generateLink({
    resourceId: companiesResource["@id"],
    resourceAction: ActionList.update,
    scope: companiesResource.scope,
    id: company["@id"],
    subResource: "team",
  })

  return (
    <section aria-labelledby="overview-subviews">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-view-soft text-view">
          <Building2 className="size-4" />
        </span>

        <div className="min-w-0">
          <h2 id="overview-subviews" className="font-semibold tracking-tight">
            A record is more than its form
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A company is five fields, the people who sign in for it and the
            batches roasted for it. Open one: the form comes first, its
            collections are tabs underneath, each filtered by the company — and a
            batch created from a tab already belongs to it.
          </p>
        </div>

        <Link
          to={href}
          className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-view/50 bg-view-soft px-3 py-1.5 text-sm font-medium text-view transition hover:-translate-y-0.5 sm:self-auto"
        >
          Open {company.name}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const RESOURCES: ViewResourceInterface[] = [
  usersResource,
  companiesResource,
  postsResource,
  commentsResource,
  productsResource,
  ordersResource,
  roastsResource,
]

function Resources() {
  return (
    <section aria-labelledby="overview-resources">
      <div className="mb-4">
        <h2
          id="overview-resources"
          className="text-lg font-semibold tracking-tight"
        >
          Seven areas, seven files
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No screen here is written by hand. Each area is one resource
          declaration, and the table, the filters, the forms, the dialogs, the
          sidebar entry and the page heading come out of it — and the shell
          around them is the package's own admin layout, configured in a line.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon
          // Each variant is named in the declaration, and that name is what the
          // layout switcher shows — so it is what is listed here too.
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
