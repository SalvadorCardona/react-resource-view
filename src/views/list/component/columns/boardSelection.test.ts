import { describe, expect, it } from "vitest"
import {
  draggedIds,
  selectRange,
  toggleSelection,
} from "@/views/list/component/columns/boardSelection"

const COLUMN = ["1", "2", "3", "4", "5"]

describe("the selection of a board", () => {
  it("adds a card, then takes it out again", () => {
    expect(toggleSelection([], "2")).toEqual(["2"])
    expect(toggleSelection(["1", "2"], "2")).toEqual(["1"])
  })

  it("selects every card between the anchor and the card, either way", () => {
    expect(selectRange([], COLUMN, "2", "4")).toEqual(["2", "3", "4"])
    expect(selectRange([], COLUMN, "4", "2")).toEqual(["2", "3", "4"])
  })

  it("keeps what was already selected, without doubling it", () => {
    expect(selectRange(["3", "9"], COLUMN, "2", "4")).toEqual(["3", "9", "2", "4"])
  })

  it("toggles the card alone when the anchor is in another column", () => {
    expect(selectRange(["9"], COLUMN, "9", "3")).toEqual(["9", "3"])
    expect(selectRange([], COLUMN, null, "3")).toEqual(["3"])
  })

  it("carries the whole selection only when the card picked up is part of it", () => {
    expect(draggedIds(["1", "3"], "3")).toEqual(["1", "3"])
    expect(draggedIds(["1", "3"], "2")).toEqual(["2"])
  })
})
