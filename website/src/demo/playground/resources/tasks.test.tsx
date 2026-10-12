import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router"
import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { parseLink, ResourceViewProvider } from "react-resource-view"
import { adminScope } from "@/demo/playground/adminScope"
import { configureLibraries, PLAYGROUND_PATH } from "@/demo/setup"

/**
 * The task board as a reader uses it: a card opens in a drawer the URL knows
 * about, and several cards move to another column at once. Needs
 * react-resource-view 0.15, where boards gained both.
 */

configureLibraries()

afterEach(cleanup)

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

const card = async (title: string) =>
  (await screen.findByText(title)).closest<HTMLElement>("[data-record-card]")!

const column = (label: string) =>
  screen.getByText(label, { selector: "header p" }).closest("header")!.parentElement!

describe("the tasks board", () => {
  it("opens a task in a drawer written into the URL, and Back closes it", async () => {
    const user = userEvent.setup()
    const router = renderPlayground("admin/admin_tasks/list")

    await user.click(await screen.findByText("Reorder 250 g kraft bags"))

    expect(router.state.location.search).toMatchObject({
      view: "admin/admin_tasks/list/admin_tasks/read/2",
    })
    const drawer = await screen.findByRole("dialog")
    expect(drawer).toHaveAttribute("data-slot", "drawer-popup")
    expect(
      within(drawer).getByDisplayValue("Reorder 250 g kraft bags")
    ).toBeVisible()

    router.history.back()

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("moves two selected tasks to another column through Move to…", async () => {
    const user = userEvent.setup()
    renderPlayground("admin/admin_tasks/list")

    await user.keyboard("{Control>}")
    await user.click(await card("Reorder 250 g kraft bags"))
    await user.click(await card("Recalibrate the roaster's probe"))
    await user.keyboard("{/Control}")

    expect(screen.getByRole("toolbar")).toHaveTextContent("2 selected")
    await user.click(screen.getByRole("button", { name: /Move to/ }))
    await user.click(await screen.findByRole("button", { name: "Done" }))

    await waitFor(() => {
      expect(column("Done")).toContainElement(
        screen.getByText("Reorder 250 g kraft bags")
      )
      expect(column("Done")).toContainElement(
        screen.getByText("Recalibrate the roaster's probe")
      )
    })
  })
})
