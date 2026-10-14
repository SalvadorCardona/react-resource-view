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

describe("ResourceViewButton, the link to the full page", () => {
  const expandLink = () => screen.queryByRole("link", { name: "Open in full page" })

  it("is in the header of a dialog, and leads to the same view on its page", async () => {
    const resource = resourceWith({ open: "dialog" })
    render(<ResourceViewButton action="update" resource={resource} id="12" />)
    await userEvent.click(screen.getByRole("button"))

    expect(expandLink()).toHaveAttribute("title", "Open in full page")
    expect(expandLink()?.getAttribute("href")).toMatch(
      new RegExp(`/${resource["@id"]}/update/12$`)
    )
  })

  it("is in the header of a drawer too", async () => {
    await openOverlay({ open: "drawer" })

    expect(expandLink()).toBeInTheDocument()
  })

  it("is left out with `expandable: false`", async () => {
    await openOverlay({ open: "dialog", expandable: false })

    expect(expandLink()).toBeNull()
  })

  it("is left out of a deletion, which has no page worth opening", async () => {
    render(
      <ResourceViewButton
        action="delete"
        resource={resourceWith({})}
        id="12"
      />
    )
    await userEvent.click(screen.getByRole("button"))

    expect(screen.getByTestId("view")).toBeInTheDocument()
    expect(expandLink()).toBeNull()
  })
})
