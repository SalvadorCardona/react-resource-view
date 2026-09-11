import type { ReactNode } from "react"
import { ClientOnly } from "@tanstack/react-router"
import { ResourceDemo } from "@/components/ResourceDemo"
import { articlesResource, sessionsResource } from "@/demo/resources"

/**
 * Seven layouts over one collection, switched by the reader.
 *
 * The switcher is not drawn here: every list draws a header of its own, and the
 * layout switcher sits in it — so a gallery adding a second row of the same
 * buttons above the view would only say twice what the view already says once.
 * Picking a layout below is the very call an application makes when it lets its
 * users pick.
 *
 * Five of the seven read the articles; a calendar and a timeline need records
 * with a start and an end, so they read the conference schedule instead. That
 * split is the honest one: a layout is declared by the resource whose data it
 * can draw.
 */
export function LayoutGallery() {
  return (
    <div className="space-y-6">
      <GalleryFrame>
        <ResourceDemo resource={articlesResource} variant="table" />
      </GalleryFrame>

      <p className="text-sm text-muted-foreground">
        A calendar and a timeline place a record between a start and an end, which
        an article has not got — so the two below read a conference schedule.
      </p>

      <GalleryFrame>
        <ResourceDemo resource={sessionsResource} variant="calendar" />
      </GalleryFrame>
    </div>
  )
}

function GalleryFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
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
