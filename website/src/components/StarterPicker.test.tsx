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

describe("StarterPicker", () => {
  it("shows the command of the backend picked, and links to its section", async () => {
    const user = userEvent.setup()
    renderPicker()

    expect(
      await screen.findByText(/init my-admin -b api-platform -u https:\/\/localhost$/)
    ).toBeVisible()

    await user.click(screen.getByRole("radio", { name: /FastAPI/ }))

    expect(screen.getByRole("radio", { name: /FastAPI/ })).toBeChecked()
    expect(
      screen.getByText(/init my-admin -b fastapi -u http:\/\/localhost:8000$/)
    ).toBeVisible()
    expect(screen.getByRole("link", { name: /FastAPI: the setup/ })).toHaveAttribute(
      "href",
      "/docs/resource-view/starter#starter-fastapi"
    )
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
