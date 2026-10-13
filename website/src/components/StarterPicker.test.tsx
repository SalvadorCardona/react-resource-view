import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it } from "vitest"
import { StarterPicker } from "@/components/StarterPicker"

afterEach(cleanup)

/** The picker links to the starter page, so it needs a router around it. */
function renderPicker() {
  const router = createRouter({
    routeTree: createRootRoute({ component: StarterPicker }),
    history: createMemoryHistory(),
  })
  return render(<RouterProvider router={router} />)
}

/** The command, whose words the picker wraps one by one so it breaks between them. */
function command(ending: RegExp) {
  return (_: string, element: Element | null) =>
    element?.tagName === "CODE" &&
    /^\$ npx react-resource-view init my-admin /.test(element.textContent ?? "") &&
    ending.test(element.textContent ?? "")
}

describe("StarterPicker", () => {
  it("shows the command of the backend picked, and links to its section", async () => {
    const user = userEvent.setup()
    renderPicker()

    expect(
      await screen.findByText(command(/-b api-platform -u https:\/\/localhost$/))
    ).toBeVisible()

    await user.click(screen.getByRole("radio", { name: /FastAPI/ }))

    expect(screen.getByRole("radio", { name: /FastAPI/ })).toBeChecked()
    expect(
      screen.getByText(command(/-b fastapi -u http:\/\/localhost:8000$/))
    ).toBeVisible()
    expect(screen.getByRole("link", { name: /FastAPI: the setup/ })).toHaveAttribute(
      "href",
      "/docs/resource-view/starter#starter-fastapi"
    )
    expect(
      screen.getByRole("link", { name: /FastAPI and Django side by side/ })
    ).toHaveAttribute("href", "/docs/resource-view/python")

    await user.click(screen.getByRole("radio", { name: /Strapi/ }))

    expect(
      screen.queryByRole("link", { name: /FastAPI and Django side by side/ })
    ).not.toBeInTheDocument()
  })

  it("offers every backend with its logo named for screen readers", async () => {
    renderPicker()

    for (const name of [
      "API Platform",
      "Spring Boot",
      "Supabase",
      "Strapi",
      "FastAPI",
      "Django",
      "Any REST API (OpenAPI)",
    ]) {
      expect(await screen.findByRole("img", { name })).toBeInTheDocument()
    }
  })
})
