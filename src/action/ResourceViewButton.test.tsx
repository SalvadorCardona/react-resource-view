import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { ActionList } from "react-data-form"
import type { ViewResourceInterface } from "@/ViewResourceInterface"

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

function resourceWith(view: object): ViewResourceInterface {
  return {
    "@id": "items",
    canUpdate: true,
    // The list's own sentence, which every action inherits.
    view: { description: "Everything the shop sells." },
    views: { [ActionList.update]: view },
    onChange: { subscribe: () => ({ unsubscribe: () => {} }) },
  } as unknown as ViewResourceInterface
}

async function openOverlay(view: object) {
  render(
    <ResourceViewButton action={ActionList.update} resource={resourceWith(view)} />
  )
  await userEvent.click(screen.getByRole("button"))
}

describe("ResourceViewButton, opened in a popup", () => {
  it("names the dialog after the view", async () => {
    await openOverlay({
      name: "Reprice a bag",
      behavior: { openIn: "popup" },
    })

    expect(
      screen.getByRole("heading", { name: "Reprice a bag" })
    ).toBeInTheDocument()
  })

  it("does not introduce a form with the sentence written for the list", async () => {
    await openOverlay({
      name: "Reprice a bag",
      description: "Everything the shop sells.",
      behavior: { openIn: "popup" },
    })

    expect(screen.queryByText("Everything the shop sells.")).toBeNull()
  })
})

describe("ResourceViewButton, opened in a drawer", () => {
  it("slides the view in rather than replacing the page", async () => {
    await openOverlay({
      name: "Reprice a bag",
      behavior: { openIn: "drawer" },
    })

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
    await openOverlay({
      name: "Reprice a bag",
      behavior: { openIn: "drawer" },
    })

    expect(document.querySelector("[data-swipe-axis='y']")).not.toBeNull()
  })
})
