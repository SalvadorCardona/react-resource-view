import { ActionList } from "react-data-form"
import { createItemMenuWithResource } from "react-resource-view"
import overviewResource from "./overview"
import routingResource from "./routing"
import layoutsResource from "./layouts"
import demoResource, { articlesResource } from "./demo"

/** Every documentation page, in reading order. */
export const pages = [
  overviewResource,
  routingResource,
  layoutsResource,
  demoResource,
]

/** The resources the site can render, pages plus the one the demo shows. */
export const resources = [...pages, articlesResource]

/**
 * The sidebar entries, built on demand.
 *
 * `createItemMenuWithResource` calls `generateLink`, which reads the routing
 * mode from the ports — so building the menu at import time, before
 * `configurePorts` runs, would freeze every link in path mode.
 */
export const getMenu = () =>
  pages.map((resource) =>
    createItemMenuWithResource({ resource, resourceAction: ActionList.read })
  )

export { overviewResource, articlesResource }
