import { afterEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createViewResource } from "@/utils/createViewResource"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import columnViewOptionFactory from "@/views/list/component/columns/columnViewOptionFactory"
import { RowComponentPropsInterface } from "@/ViewInterface"

/**
 * A card holding one long unbreakable word — a path, a URL, an identifier —
 * widened its whole column as soon as a parent sized the columns, and the
 * column slid under its neighbours. jsdom lays nothing out, so what is checked
 * is what keeps the width: the column may be narrower than its content, and the
 * content of a card may break a word to fit.
 */

const LONG_WORD = "/var/lib/ticket-runner/worktrees/" + "a".repeat(120)

function TaskRow({ row }: RowComponentPropsInterface) {
  return <span>{row?.data?.title}</span>
}

const tasks = createViewResource("width_board_tasks", {
  name: "Tasks",
  scope: "width_board",
  view: {
    name: "Tasks",
    viewVariants: [
      columnViewOptionFactory({
        rowComponent: TaskRow,
        identifierKey: "status",
        identifierKeyList: [
          { value: "todo", label: "To do" },
          { value: "done", label: "Done" },
        ],
      }),
    ],
  },
})

afterEach(() => localStorage.clear())

describe("the width of a column", () => {
  it("does not follow a long word in one of its cards", async () => {
    localStorage.setItem(
      "width_board_tasks",
      JSON.stringify({
        "@id": "width_board_tasks",
        "@type": "Collection",
        member: [
          {
            "@id": "/width_board_tasks/1",
            "@type": "width_board_tasks",
            id: "1",
            title: LONG_WORD,
            status: "todo",
          },
        ],
        totalItems: 1,
      })
    )

    render(
      <ResourceViewProvider
        viewResourceContextParams={{
          scope: "width_board",
          resourceId: "width_board_tasks",
        }}
        configuration={{ resources: [tasks], defaultScope: "width_board" }}
      />
    )

    const word = await screen.findByText(LONG_WORD)
    const column = screen.getByText("To do").closest("header")!.parentElement!

    expect(column).toHaveClass("w-72", "min-w-0")
    expect(column).toContainElement(word)
    expect(word.closest(".break-words")).not.toBeNull()
  })
})
