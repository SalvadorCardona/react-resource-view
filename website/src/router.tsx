import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // GitHub Pages answers /docs/form with a 301 to /docs/form/ — on its own host,
    // not the domain in front of it. Every link ends with the slash so no click
    // goes through that redirect.
    trailingSlash: "always",
    // Hovering a sidebar entry is a strong enough signal to fetch the page.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
