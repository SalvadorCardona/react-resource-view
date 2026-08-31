import { useState } from "react"
import { ClientOnly } from "@tanstack/react-router"
import {
  CalendarRange,
  Columns3,
  GanttChartSquare,
  LayoutGrid,
  ListChecks,
  PanelsTopLeft,
  Table2,
  type LucideIcon,
} from "lucide-react"
import { ResourceDemo } from "@/components/ResourceDemo"
import { articlesResource, sessionsResource } from "@/demo/resources"
import { cn } from "@/lib/cn"

interface LayoutEntry {
  id: string
  label: string
  icon: LucideIcon
  /** One line, shown under the switcher — what this layout is for. */
  blurb: string
  /** Both resources declare the layouts that suit the shape of their records. */
  schedule?: boolean
}

/**
 * The seven layouts, in the order the documentation introduces them.
 *
 * Five of them read the articles; a calendar and a timeline need records with a
 * start and an end, so they read the conference schedule instead. That split is
 * the honest one: a layout is declared by the resource whose data it can draw.
 */
const LAYOUTS: LayoutEntry[] = [
  {
    id: "table",
    label: "Table",
    icon: Table2,
    blurb: "One column per field, editable in place.",
  },
  {
    id: "card",
    label: "Cards",
    icon: LayoutGrid,
    blurb: "The same records, drawn by a row component of your own.",
  },
  {
    id: "item",
    label: "List",
    icon: ListChecks,
    blurb: "One record per line, for a narrow column.",
  },
  {
    id: "column",
    label: "Columns",
    icon: Columns3,
    blurb: "Grouped by a field — here the status. A board, without a board library.",
  },
  {
    id: "split",
    label: "Split",
    icon: PanelsTopLeft,
    blurb: "The list on the left, the record open on the right.",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarRange,
    blurb: "A week of sessions, placed by their start and end.",
    schedule: true,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: GanttChartSquare,
    blurb: "The same sessions, one lane per room.",
    schedule: true,
  },
]

/**
 * Seven layouts over one collection, switched by the reader.
 *
 * The point is not the gallery, it is that nothing below the switcher changes:
 * the resource, the form, the filters and the permissions are declared once,
 * and the layout is a line in `viewVariants`. Picking one here is the same call
 * an application makes when it lets its users pick.
 */
export function LayoutGallery() {
  const [current, setCurrent] = useState("table")
  const layout = LAYOUTS.find((entry) => entry.id === current) ?? LAYOUTS[0]!

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-3 py-3">
        <div className="flex flex-wrap gap-1">
          {LAYOUTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCurrent(id)}
              aria-pressed={current === id}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition",
                current === id
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <p className="mt-2.5 px-1 text-xs text-muted-foreground">
          {layout.blurb}
        </p>
      </div>

      <div className="p-5">
        <ClientOnly fallback={<GallerySkeleton />}>
          {/* Remounted per layout: the variant is the view's opening position,
              not a prop it keeps watching. */}
          <ResourceDemo
            key={layout.id}
            resource={layout.schedule ? sessionsResource : articlesResource}
            variant={layout.id}
          />
        </ClientOnly>
      </div>
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
