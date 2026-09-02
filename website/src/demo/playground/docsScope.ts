import { CalendarRange, LayoutDashboard, PanelsTopLeft } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  createItemMenuWithResource,
  generateLink,
  type ScopeInterface,
} from "react-resource-view"
import { seedDemoData } from "@/demo/data"
import { articlesResource, sessionsResource } from "@/demo/resources"
import { AdminShell } from "@/demo/playground/AdminShell"

// Same reasoning as the administration: entering the scope is what loads this
// module, and the views fetch as soon as they mount.
seedDemoData()

/**
 * The second area of the playground: the two resources the documentation's
 * examples are built on.
 *
 * It exists because every demo embedded in a documentation page builds its
 * links in the `docs` scope, and those links land here. Declaring the scope is
 * what lets a reader who arrived that way — on one article, out of one example
 * — find the rest of the playground instead of a dead end.
 *
 * It shares the administration's shell on purpose: two scopes, one chrome, is
 * exactly the shape of an application whose back office and customer portal
 * look alike but hold different resources.
 */
export const docsScope: ScopeInterface = {
  name: "docs",
  label: "Documentation demos",
  resources: [articlesResource, sessionsResource],
  decoratorComponent: AdminShell,
  // Where the area opens when the URL names the scope and nothing else — which
  // is what the other scope's entry into this one links to.
  defaultViewResourceContextParams: {
    resourceId: articlesResource["@id"],
    resourceAction: ActionList.list,
  },
  menu: [
    // The two demo resources are rendered inside pages of prose, never in a
    // menu, so they declare no icon of their own: this scope supplies them.
    {
      ...createItemMenuWithResource({ resource: articlesResource }),
      icon: PanelsTopLeft,
    },
    {
      ...createItemMenuWithResource({ resource: sessionsResource }),
      icon: CalendarRange,
    },
    {
      name: "Back office",
      icon: LayoutDashboard,
      href: generateLink({ scope: "admin" }),
    },
  ],
}
