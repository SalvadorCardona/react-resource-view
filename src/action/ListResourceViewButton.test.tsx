import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ActionList } from "react-data-form"
import type { ViewInterface } from "@/ViewInterface"

// The button under test only decides *which* actions to draw; what a single
// action renders is ResourceViewButton's business and is stubbed out here.
vi.mock("@/action/ResourceViewButton", () => ({
  default: ({ action }: { action: ActionList }) => (
    <button data-testid={`action-${action}`}>{action}</button>
  ),
}))

const context: { view?: ViewInterface } = {}

vi.mock("@/provider/useCurrentViewResourceContext", () => ({
  default: () => context,
}))

const { default: ListResourceViewButton } = await import(
  "@/action/ListResourceViewButton"
)

function renderWith(view?: ViewInterface) {
  context.view = view
  return render(<ListResourceViewButton />)
}

describe("ListResourceViewButton", () => {
  it("offers update and delete, and no read, when the view says nothing", () => {
    renderWith({})

    expect(screen.queryByTestId(`action-${ActionList.read}`)).toBeNull()
    expect(screen.getByTestId(`action-${ActionList.update}`)).toBeInTheDocument()
    expect(screen.getByTestId(`action-${ActionList.delete}`)).toBeInTheDocument()
  })

  it("puts read back when the view asks for it", () => {
    renderWith({
      behavior: {
        rowActions: [ActionList.read, ActionList.update, ActionList.delete],
      },
    })

    expect(screen.getByTestId(`action-${ActionList.read}`)).toBeInTheDocument()
  })

  it("draws only the actions the view asks for, in that order", () => {
    renderWith({
      behavior: { rowActions: [ActionList.delete, ActionList.update] },
    })

    expect(
      screen.getAllByRole("button").map((button) => button.textContent)
    ).toEqual([ActionList.delete, ActionList.update])
  })

  it("draws nothing when the view asks for no action at all", () => {
    renderWith({ behavior: { rowActions: [] } })

    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })
})
