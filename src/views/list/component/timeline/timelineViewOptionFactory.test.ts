import { describe, expect, it, vi } from "vitest"
import { CalendarRange } from "lucide-react"

vi.mock("@/utils/createView", () => ({
  createView: (view: Record<string, unknown>) => ({ ...view }),
}))

vi.mock(
  "@/views/list/component/timeline/ListTimeline",
  () => ({
    default: () => null,
  })
)

vi.mock(
  "@/views/list/component/dump/DumpItemComponent",
  () => ({
    DumpItemComponent: () => null,
  })
)

vi.mock(
  "@/views/list/component/dump/DumpRowComponent",
  () => ({
    DumpRowComponent: () => null,
  })
)

import timelineViewOptionFactory from "./timelineViewOptionFactory"

describe("timelineViewOptionFactory", () => {
  it("uses sensible defaults when no args are passed", () => {
    const view = timelineViewOptionFactory()

    expect(view.name).toBe("timeline")
    expect(view.icon).toBe(CalendarRange)
    expect(view.startDateKey).toBe("startDate")
    expect(view.endDateKey).toBe("endDate")
    expect(view.titleKey).toBe("title")
    expect(view.statusKey).toBe("state")
    expect(view.daysToShow).toBe(14)
    expect(view.unassignedLabel).toBe("Unassigned")
    expect(view.showUnassigned).toBe(true)
  })

  it("allows overrides for keys and labels", () => {
    const view = timelineViewOptionFactory({
      startDateKey: "from",
      endDateKey: "to",
      titleKey: "name",
      groupKey: "category",
      statusKey: "status",
      daysToShow: 21,
      unassignedLabel: "Pas de catégorie",
      showUnassigned: false,
    })

    expect(view.startDateKey).toBe("from")
    expect(view.endDateKey).toBe("to")
    expect(view.titleKey).toBe("name")
    expect(view.groupKey).toBe("category")
    expect(view.statusKey).toBe("status")
    expect(view.daysToShow).toBe(21)
    expect(view.unassignedLabel).toBe("Pas de catégorie")
    expect(view.showUnassigned).toBe(false)
  })

  it("preserves user-provided color mapping", () => {
    const colors = {
      CONFIRMED: "bg-green-100",
      CANCELLED: "bg-zinc-100",
    }
    const view = timelineViewOptionFactory({ colorByStatus: colors })

    expect(view.colorByStatus).toEqual(colors)
  })

  it("forwards resolveGroupForRow and resolveGroups callbacks", () => {
    const resolveGroupForRow = vi.fn()
    const resolveGroups = vi.fn()
    const view = timelineViewOptionFactory({
      resolveGroupForRow,
      resolveGroups,
    })

    expect(view.resolveGroupForRow).toBe(resolveGroupForRow)
    expect(view.resolveGroups).toBe(resolveGroups)
  })
})
