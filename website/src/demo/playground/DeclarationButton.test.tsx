import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { parseLink, ResourceViewProvider } from "react-resource-view"
import { adminScope } from "@/demo/playground/adminScope"
import { configureLibraries, PLAYGROUND_PATH } from "@/demo/setup"

configureLibraries()

afterEach(cleanup)

/** The back office as `/playground` mounts it, on a router of its own. */
function Playground() {
  const searchStr = useRouterState({ select: (state) => state.location.searchStr })

  return (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(searchStr)}
      configuration={{
        scopes: { admin: async () => adminScope },
        defaultScope: "admin",
      }}
    />
  )
}

function renderPlayground(view: string) {
  const rootRoute = createRootRoute()
  const playgroundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: PLAYGROUND_PATH,
    component: Playground,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([playgroundRoute]),
    history: createMemoryHistory({
      initialEntries: [`${PLAYGROUND_PATH}?view=${view}`],
    }),
  })

  render(<RouterProvider router={router} />)

  return router
}

describe("the declaration button", () => {
  it("opens the file of the resource, on the lines of the active layout", async () => {
    // jsdom has no layout to scroll.
    Element.prototype.scrollIntoView = vi.fn()
    const user = userEvent.setup()
    renderPlayground("admin/admin_products/list&variant=cards")

    await user.click(
      await screen.findByRole("button", { name: "View the declaration" })
    )

    // The panel and the highlighter come in one lazy chunk.
    const panel = await screen.findByRole(
      "complementary",
      { name: "Resource declaration" },
      { timeout: 10_000 }
    )
    expect(panel).toHaveTextContent("resources/products.ts")
    expect(panel).toHaveTextContent("Cards layout is highlighted")
    expect(panel.querySelector(".line-marked")).toHaveTextContent("layout.cards")
    expect(within(panel).getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/products\.ts#L\d+-L\d+$/)
    )
  })
})
