import { describe, expect, it } from "vitest"
import { ActionList } from "react-data-form"
import { createViewResource } from "@/utils/createViewResource"
import columnViewOptionFactory from "@/views/list/component/columns/columnViewOptionFactory"
import tableViewOptionFactory from "@/views/list/component/table/tableViewOptionFactory"
import { isFullWidthView } from "@/utils/isFullWidthView"

const narrowResource = createViewResource("full_width_narrow", {
  view: { name: "Narrow" },
})

const wideResource = createViewResource("full_width_wide", {
  view: { name: "Wide", fullWidth: true },
  views: { [ActionList.update]: { name: "Edit", fullWidth: false } },
})

const boardOnlyResource = createViewResource("full_width_board_only", {
  view: {
    name: "Tasks",
    viewVariants: [
      columnViewOptionFactory({ id: "board", fullWidth: true }),
      tableViewOptionFactory({ id: "table" }),
    ],
  },
})

describe("isFullWidthView", () => {
  it("keeps every view narrow when nothing asks otherwise", () => {
    for (const resourceAction of Object.values(ActionList)) {
      expect(isFullWidthView({ resource: narrowResource, resourceAction })).toBe(
        false
      )
    }
    expect(isFullWidthView(undefined)).toBe(false)
  })

  it("widens every action of a resource whose view asks for it", () => {
    expect(
      isFullWidthView({ resource: wideResource, resourceAction: ActionList.list })
    ).toBe(true)
    expect(
      isFullWidthView({ resource: wideResource, resourceAction: ActionList.read })
    ).toBe(true)
  })

  it("lets an action's own view win over the resource's", () => {
    expect(
      isFullWidthView({ resource: wideResource, resourceAction: ActionList.update })
    ).toBe(false)
  })

  it("widens only the list variant that asks for it", () => {
    const list = { resource: boardOnlyResource, resourceAction: ActionList.list }

    expect(isFullWidthView({ ...list, viewVariant: "board" })).toBe(true)
    expect(isFullWidthView({ ...list, viewVariant: "table" })).toBe(false)
    // No variant in the URL: the list opens on its first one.
    expect(isFullWidthView(list)).toBe(true)
  })

  it("lets a variant win over the resource's view, both ways", () => {
    const resource = createViewResource("full_width_variant_wins", {
      view: {
        fullWidth: true,
        viewVariants: [
          tableViewOptionFactory({ id: "table" }),
          columnViewOptionFactory({ id: "board", fullWidth: false }),
        ],
      },
    })
    const list = { resource, resourceAction: ActionList.list }

    expect(isFullWidthView({ ...list, viewVariant: "table" })).toBe(true)
    expect(isFullWidthView({ ...list, viewVariant: "board" })).toBe(false)
  })

  it("leaves the forms of a resource alone when only a list variant is wide", () => {
    // The first variant is merged into every action's view on screen: read
    // off that, a wide board would widen the edit form as well.
    for (const resourceAction of [ActionList.create, ActionList.update]) {
      expect(
        isFullWidthView({
          resource: boardOnlyResource,
          resourceAction,
          viewVariant: "board",
        })
      ).toBe(false)
    }
  })
})
