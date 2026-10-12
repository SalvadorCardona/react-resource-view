import { describe, expect, it } from "vitest"
import {
  countLines,
  DECLARATIONS,
  findLayoutLines,
  githubUrl,
} from "@/demo/playground/declarations"
import { PRODUCTS_ID, TASKS_ID } from "@/demo/playground/adminData"

describe("the declarations behind the screens", () => {
  it("marks the single-line entry of a layout", () => {
    const { source } = DECLARATIONS[PRODUCTS_ID]
    const range = findLayoutLines(source, "Cards")!

    expect(range.from).toBe(range.to)
    expect(source.split("\n")[range.from - 1]).toContain("cardViewOptionFactory")
  })

  it("marks an entry that spans several lines up to its closing parenthesis", () => {
    const { source } = DECLARATIONS[TASKS_ID]
    const range = findLayoutLines(source, "Table")!
    const lines = source.split("\n")

    expect(lines[range.from - 1]).toContain("tableViewOptionFactory({")
    expect(lines[range.to - 1].trim()).toBe("}),")
  })

  it("marks nothing for a layout the file does not name", () => {
    expect(findLayoutLines(DECLARATIONS[PRODUCTS_ID].source, "Nope")).toBeUndefined()
    expect(
      findLayoutLines(DECLARATIONS[PRODUCTS_ID].source, undefined)
    ).toBeUndefined()
  })

  it("counts lines and links to the file on GitHub, lines included", () => {
    expect(countLines("a\nb\n")).toBe(2)
    expect(githubUrl({ path: "x/y.ts", source: "" }, { from: 3, to: 5 })).toBe(
      "https://github.com/SalvadorCardona/react-resource-view/blob/main/x/y.ts#L3-L5"
    )
  })
})
