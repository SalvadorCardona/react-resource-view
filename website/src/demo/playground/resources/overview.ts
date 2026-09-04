import { LayoutDashboard } from "lucide-react"
import { createViewResource } from "react-resource-view"
import { OVERVIEW_ID } from "@/demo/playground/adminData"
import { Overview } from "@/demo/playground/Overview"

/**
 * The screen the back office opens on.
 *
 * It holds no rows of its own — `viewComponent` replaces the list with a
 * component that reads the other collections and links into them. It is still
 * declared as a resource, because that is what gives it a place in the menu,
 * an entry in the URL and the shell around it, at the cost of six lines.
 */
export const overviewResource = createViewResource(OVERVIEW_ID, {
  name: "Overview",
  scope: "admin",
  icon: LayoutDashboard,
  canRead: true,
  view: {
    name: "Overview",
    description:
      "The roastery at a glance. Every number is a link into the screen behind it, filters included.",
    viewComponent: Overview,
  },
})
