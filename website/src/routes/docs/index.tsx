import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/docs` has no page of its own: the site documents two packages and picking
 * one for the reader is the sidebar's job. Most readers come for the back
 * office, so `/docs` opens on the resource view's quickstart.
 */
export const Route = createFileRoute("/docs/")({
  beforeLoad: () => {
    throw redirect({ to: "/docs/resource-view/quickstart", replace: true })
  },
})
