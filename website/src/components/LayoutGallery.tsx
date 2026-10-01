import type { ReactNode } from "react"
import { ClientOnly } from "@tanstack/react-router"
import { ResourceDemo } from "@/components/ResourceDemo"
import { galleryArticlesResource } from "@/demo/resources"

/**
 * Seven layouts over one collection, switched by the reader.
 *
 * The switcher is not drawn here: every list draws a header of its own, and the
 * layout switcher sits in it — so a gallery adding a second row of the same
 * buttons above the view would only say twice what the view already says once.
 * Picking a layout below is the very call an application makes when it lets its
 * users pick.
 *
 * All seven read the same articles. A calendar and a timeline need a start and
 * an end, which an article gets from its editorial calendar: the window it is
 * written in. The calendar places each article on the day its writing starts,
 * the timeline bands the windows by author — who writes what, when.
 */
export function LayoutGallery() {
  return (
    <GalleryFrame>
      <ResourceDemo resource={galleryArticlesResource} variant="table" />
    </GalleryFrame>
  )
}

/**
 * The switcher's seven buttons are wider than a phone; the list does not wrap
 * them, and the frame clips what overflows. They scroll sideways instead, so
 * none is cut off.
 */
function GalleryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm [&_[data-slot=tabs]]:max-w-full [&_[data-slot=tabs]]:overflow-x-auto">
      <ClientOnly fallback={<GallerySkeleton />}>{children}</ClientOnly>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      <div className="h-9 w-56 rounded-lg bg-muted" />
      <div className="h-40 w-full rounded-lg bg-muted" />
    </div>
  )
}
