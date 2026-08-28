import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/docs` has no page of its own: the site documents two packages and picking
 * one for the reader is the sidebar's job. The forms section comes first
 * because the view package builds on it.
 */
export const Route = createFileRoute("/docs/")({
  beforeLoad: () => {
    throw redirect({ to: "/docs/form", replace: true })
  },
})
