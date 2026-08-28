import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
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
