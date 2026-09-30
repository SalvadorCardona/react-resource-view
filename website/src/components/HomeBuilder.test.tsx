import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { HomeBuilder } from "@/components/HomeBuilder"
import { configureLibraries } from "@/demo/setup"

configureLibraries()

afterEach(cleanup)

/** The field's card in the left panel, where its controllers are picked. */
function fieldCard(label: string): HTMLElement {
  return screen.getByRole("switch", { name: `Remove the ${label} field` }).closest("li")!
}

describe("HomeBuilder", () => {
  it("redraws the form when a field's controller changes", async () => {
    const user = userEvent.setup()
    const { container } = render(<HomeBuilder />)

    expect(await screen.findByRole("textbox", { name: /title/i })).toBeVisible()
    expect(screen.queryAllByRole("radio")).toHaveLength(0)
    expect(container.querySelector("textarea")).toBeNull()

    await user.click(within(fieldCard("Status")).getByRole("button", { name: "Radio" }))
    expect(await screen.findAllByRole("radio")).toHaveLength(3)

    await user.click(
      within(fieldCard("Title")).getByRole("button", { name: "Textarea" })
    )
    expect(container.querySelector("textarea")).not.toBeNull()
  })
})
