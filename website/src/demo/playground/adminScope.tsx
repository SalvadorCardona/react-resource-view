import { Link } from "@tanstack/react-router"
import { BookOpen, Blocks, Factory, Newspaper, ShoppingBag } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  createAdminLayout,
  createItemMenuWithResource,
  generateLink,
  type ScopeInterface,
} from "react-resource-view"
import {
  commentsResource,
  companiesResource,
  ordersResource,
  overviewResource,
  postsResource,
  productsResource,
  roastsResource,
  usersResource,
} from "@/demo/playground/resources"

/**
 * The one thing `AdminLayout` alone cannot offer: a way to the standalone
 * builder — the same two kits, on sample data, for whoever wants to try one
 * without opening a record. Rendered in the top bar via `createAdminLayout`'s
 * `topBarEnd`, so it survives every screen of the scope.
 *
 * A plain router `Link` rather than the package's own: it leaves the resource
 * context entirely, for a route this scope does not own.
 */
function BuilderLink() {
  return (
    <Link
      to="/playground/builder"
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
      <Blocks className="size-4" />
      Builder demo
    </Link>
  )
}

/**
 * The back office of the playground: one area, eight resources, one menu.
 *
 * This is the whole administration. There is no screen written by hand
 * anywhere: the lists and their layouts, the filter bars, the forms and the
 * delete confirmations all come from the declarations in `resources/`, and
 * everything around them is `AdminLayout` — the package's ready-made admin
 * template, configured in a line and fed by the menu below. The overview is
 * the one exception, and it is a resource too, with a `viewComponent` of its
 * own instead of a list.
 *
 * The scope is loaded lazily by the playground, which is the point of a scope
 * being a module rather than a folder: a reader who only follows a link from a
 * documentation page never downloads any of it.
 */
export const adminScope: ScopeInterface = {
  name: "admin",
  label: "Roastery admin",
  resources: [
    overviewResource,
    usersResource,
      companiesResource,
    postsResource,
    commentsResource,
    productsResource,
    ordersResource,
    roastsResource,
  ],
  decoratorComponent: createAdminLayout({ topBarEnd: <BuilderLink /> }),
  // Where the scope opens when the URL names it and nothing else.
  defaultViewResourceContextParams: {
    resourceId: overviewResource["@id"],
    resourceAction: ActionList.list,
  },
  // Data, rendered by the template: `AdminLayout` reads this menu for its
  // sidebar on desktop and for its bottom bar on narrow screens. Each entry is
  // built from its resource, so a label, an icon and a link are declared once.
  menu: [
    createItemMenuWithResource({ resource: overviewResource }),
    createItemMenuWithResource({ resource: usersResource }),
    createItemMenuWithResource({ resource: companiesResource }),
    {
      name: "Blog",
      icon: Newspaper,
      items: [
        createItemMenuWithResource({ resource: postsResource }),
        createItemMenuWithResource({ resource: commentsResource }),
      ],
    },
    {
      name: "Catalogue",
      icon: ShoppingBag,
      items: [
        createItemMenuWithResource({ resource: productsResource }),
        createItemMenuWithResource({ resource: ordersResource }),
      ],
    },
    {
      name: "Production",
      icon: Factory,
      items: [createItemMenuWithResource({ resource: roastsResource })],
    },
    // Naming only the scope lands on its `defaultViewResourceContextParams`,
    // which is how one area links to another without knowing its resources.
    {
      name: "Documentation demos",
      icon: BookOpen,
      href: generateLink({ scope: "docs" }),
    },
  ],
}
