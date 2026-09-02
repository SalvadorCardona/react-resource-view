import { BookOpen, Newspaper, ShoppingBag } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  createItemMenuWithResource,
  generateLink,
  type ScopeInterface,
} from "react-resource-view"
import { AdminShell } from "@/demo/playground/AdminShell"
import { seedAdminData } from "@/demo/playground/adminData"
import {
  commentsResource,
  ordersResource,
  postsResource,
  productsResource,
  usersResource,
} from "@/demo/playground/adminResources"

// Importing this module is what entering the scope means, and a view fetches as
// soon as it mounts — so this is the last moment the fixtures can be written.
seedAdminData()

/**
 * The back office of the playground: one area, five resources, one menu.
 *
 * This is the whole administration. There is no screen written by hand
 * anywhere: the lists and their layouts, the filter bars, the forms and the
 * delete confirmations all come from the five declarations in
 * `adminResources`, and everything the shell draws around them is read from
 * the fields below.
 *
 * The scope is loaded lazily by the playground, which is the point of a scope
 * being a module rather than a folder: a reader who only follows a link from a
 * documentation page never downloads any of it.
 */
export const adminScope: ScopeInterface = {
  name: "admin",
  label: "Roastery admin",
  resources: [
    usersResource,
    postsResource,
    commentsResource,
    productsResource,
    ordersResource,
  ],
  // Wraps every view of the area — see `AdminShell`.
  decoratorComponent: AdminShell,
  // Where the area opens when the URL names the scope and nothing else, which
  // is what the "Back office" entry of the other scope links to.
  defaultViewResourceContextParams: {
    resourceId: usersResource["@id"],
    resourceAction: ActionList.list,
  },
  // Data, rendered by the shell. Each entry is built from its resource, so a
  // label, an icon and a link are declared once and read here.
  menu: [
    createItemMenuWithResource({ resource: usersResource }),
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
    // Naming only the scope lands on its `defaultViewResourceContextParams`,
    // which is how one area links to another without knowing its resources.
    {
      name: "Documentation demos",
      icon: BookOpen,
      href: generateLink({ scope: "docs" }),
    },
  ],
}
