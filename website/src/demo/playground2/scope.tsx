import { Link } from "@tanstack/react-router"
import { Blocks } from "lucide-react"
import { ActionList } from "react-data-form"
import {
  createAdminLayout,
  createItemMenuWithResource,
  type ScopeInterface,
} from "react-resource-view"
import { cmsResource, profilesResource } from "@/demo/playground2/resources"

/**
 * The one thing `AdminLayout` alone cannot offer: a way back to the builder
 * that feeds these two resources. Rendered in the top bar via
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
 * playground2's back office: two resources, on `AdminLayout` rather than the
 * hand-written shell `/playground` runs on.
 *
 * Where `/playground` needed `AdminShell` for its "Declaration" panel and
 * reset button, this scope needs neither — so the ready-made template is
 * enough, configured only for the link back to the builder.
 */
export const playground2Scope: ScopeInterface = {
  name: "playground2",
  label: "Studio",
  resources: [cmsResource, profilesResource],
  decoratorComponent: createAdminLayout({ topBarEnd: <BuilderLink /> }),
  defaultViewResourceContextParams: {
    resourceId: cmsResource["@id"],
    resourceAction: ActionList.list,
  },
  menu: [
    createItemMenuWithResource({ resource: cmsResource }),
    createItemMenuWithResource({ resource: profilesResource }),
  ],
}
