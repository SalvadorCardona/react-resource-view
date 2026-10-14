import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { ActionList } from "react-data-form"
import { createViewResource } from "@/utils/createViewResource"
import type { UpdateViewDefinition } from "@/ResourceDefinition"

// What the dialog wraps is a whole view context; the button's own decision is
// what the dialog is called, which is all this file is about.
vi.mock("@/provider/ViewResourceContextProvider", () => ({
  default: () => <div data-testid="view" />,
}))

vi.mock("@/provider/useCurrentViewResourceContext", () => ({
  default: () => ({ fetchData: () => {} }),
}))

vi.mock("@/ports", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/ports")>()),
  useNavigate: () => () => {},
}))

const { default: ResourceViewButton } = await import("@/action/ResourceViewButton")

let count = 0

function resourceWith(update: UpdateViewDefinition) {
  return createViewResource(`button_items_${++count}`, {
  storage: "local",
  // The list's own sentence, which every action inherits.
  description: "Everything the shop sells.",
  views: { update: { ...update } },
})
}

async function openOverlay(view: UpdateViewDefinition) {
  render(
    <ResourceViewButton action={ActionList.update} resource={resourceWith(view)} />
  )
  await userEvent.click(screen.getByRole("button"))
}

describe("ResourceViewButton, opened in a dialog", () => {
  it("names the dialog after the view", async () => {
    await openOverlay({ title: "Reprice a bag", open: "dialog" })

    expect(
      screen.getByRole("heading", { name: "Reprice a bag" })
    ).toBeInTheDocument()
  })

  it("does not introduce a form with the sentence written for the list", async () => {
    await openOverlay({
      title: "Reprice a bag",
      description: "Everything the shop sells.",
      open: "dialog",
    })

    expect(screen.queryByText("Everything the shop sells.")).toBeNull()
  })
})

describe("ResourceViewButton, opened in a drawer", () => {
  it("slides the view in rather than replacing the page", async () => {
    await openOverlay({ title: "Reprice a bag", open: "drawer" })

    expect(
      screen.getByRole("heading", { name: "Reprice a bag" })
    ).toBeInTheDocument()
    expect(screen.getByTestId("view")).toBeInTheDocument()
  })

  /**
   * The panel travels along the axis it is swiped away on, and `matchMedia` is
   * stubbed as a narrow screen for the tests — so what a phone gets is what is
   * asserted here.
   */
  it("comes up from the bottom on a narrow screen", async () => {
    await openOverlay({ title: "Reprice a bag", open: "drawer" })

    expect(document.querySelector("[data-swipe-axis='y']")).not.toBeNull()
  })
})
