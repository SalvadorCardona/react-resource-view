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
import { afterEach, describe, expect, it } from "vitest"
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
      configuration={{ scopes: { admin: async () => adminScope }, defaultScope: "admin" }}
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

describe("usersResource", () => {
  it("opens an account on its page, not on the edit drawer", async () => {
    const user = userEvent.setup()
    const router = renderPlayground("admin/admin_users/list")

    const row = (await screen.findByText("Ada Lovelace")).closest("tr")!
    await user.click(within(row).getByRole("button", { name: "Open" }))

    expect(router.state.location.search).toMatchObject({
      view: "admin/admin_users/read/1",
    })
    expect(await screen.findByRole("tab", { name: /Curriculum vitæ/ })).toBeVisible()
    expect(screen.getByRole("tab", { name: /Posts/ })).toBeVisible()
    expect(screen.getByRole("tab", { name: /Activity/ })).toBeVisible()
    expect(screen.queryByText("Edit a user")).toBeNull()
  })

  it("opens an account on its page from the card grid too", async () => {
    const user = userEvent.setup()
    const router = renderPlayground("admin/admin_users/list")

    await screen.findByText("Ada Lovelace")
    await user.click(screen.getByRole("tab", { name: "Cards" }))
    const card = (await screen.findByText("Ada Lovelace")).closest(".rounded-2xl")!
    await user.click(within(card as HTMLElement).getByRole("button", { name: "Open" }))

    expect(router.state.location.search).toMatchObject({
      view: "admin/admin_users/read/1",
    })
    expect(await screen.findByRole("tab", { name: /Curriculum vitæ/ })).toBeVisible()
  })

  it("keeps the edit drawer one button away from a row", async () => {
    const user = userEvent.setup()
    renderPlayground("admin/admin_users/list")

    const row = (await screen.findByText("Ada Lovelace")).closest("tr")!
    await user.click(within(row).getByRole("button", { name: "Edit" }))

    expect(await screen.findByText("Edit a user")).toBeVisible()
  })
})
