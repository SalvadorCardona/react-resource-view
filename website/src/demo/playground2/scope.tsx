import { Link } from "@tanstack/react-router"
import { Blocks, Factory, Newspaper, ShoppingBag } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  createAdminLayout,
  createItemMenuWithResource,
  type ScopeInterface,
} from "react-resource-view"
import {
  cmsResource,
  commentsResource,
  companiesResource,
  ordersResource,
  overviewResource,
  postsResource,
  productsResource,
  profilesResource,
  roastsResource,
  usersResource,
} from "@/demo/playground2/resources"

/**
 * The one thing `AdminLayout` alone cannot offer: a way back to the builder
 * that feeds CMS and My profiles. Rendered in the top bar via
 * `createAdminLayout`'s `topBarEnd`, so it survives every screen of the scope.
 *
 * A plain router `Link` rather than the package's own: it leaves the resource
 * context entirely, for a route this scope does not own.
 */
function BuilderLink() {
  return (
    <Link
      to="/playground2/builder"
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
      <Blocks className="size-4" />
      Page builder
    </Link>
  )
}

/**
 * playground2's back office: the whole of `/playground`'s administration, plus
 * the two collections the builder writes, on `AdminLayout` rather than on the
 * hand-written shell.
 *
 * The resources are the same declarations as `/playground`'s — same fields,
 * same layouts, same sub-views — under storage ids of their own, so the two
 * playgrounds stay separate sandboxes. What changes is everything around them:
 * where `/playground` needed `AdminShell` for its sidebar, its headings and its
 * "Declaration" panel, this scope declares a menu and hands the rest to the
 * ready-made template.
 */
export const playground2Scope: ScopeInterface = {
  name: "playground2",
  label: "Studio",
  resources: [
    overviewResource,
    cmsResource,
    profilesResource,
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
    {
      name: "Studio",
      icon: Blocks,
      items: [
        createItemMenuWithResource({ resource: cmsResource }),
        createItemMenuWithResource({ resource: profilesResource }),
      ],
    },
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
  ],
}
