import { describe, expect, it, vi } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import { ActionList } from "react-data-form"
import { createPubSub } from "coooking-pubsub"
import type { ViewResourceInterface } from "@/ViewResourceInterface"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"

vi.mock("@/ports", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/ports")>()),
  useNavigate: () => () => {},
}))

const { default: ResourceViewButton } = await import("@/action/ResourceViewButton")

const rows = {
  A: [{ "@id": "/ideas/1", name: "Idea A" }],
  B: [{ "@id": "/ideas/2", name: "Idea B" }],
}

/**
 * A list whose every row carries a button opening its form over the page, the
 * way a card list with a filter does. The row stays mounted from one filter to
 * the next, and so does its button.
 */
function Cards() {
  const list = useCurrentViewResourceContext()
  const items = (list.data as { member?: { name: string }[] } | undefined)?.member

  return (
    <>
      <button onClick={() => list.setFilter({ status: "B" })}>Filter on B</button>
      {[0, 1].map((key) => (
        <div key={key}>
          <ResourceViewButton action={ActionList.update} data={{ "@id": "/x" }} />
        </div>
      ))}
      <ul>
        {items?.map((item) => (
          <li key={item.name}>{item.name}</li>
        ))}
      </ul>
    </>
  )
}

function createIdeas() {
  const getCollection = vi.fn(async (filter?: { status?: "A" | "B" }) => ({
    data: { member: rows[filter?.status ?? "A"] },
  }))
  const resource = {
    "@id": "ideas",
    "@type": "view-resource",
    resourceBuild: true,
    canUpdate: true,
    views: {
      [ActionList.list]: { viewComponent: Cards },
      [ActionList.update]: { behavior: { openIn: "popup" } },
    },
    onChange: createPubSub(),
    getCollection,
  } as unknown as ViewResourceInterface

  return { resource, getCollection }
}

describe("ResourceViewButton, after a save from a row of a filtered list", () => {
  it("reads the list again with the filter it has now, not the one it mounted with", async () => {
    const { resource, getCollection } = createIdeas()
    render(
      <ViewResourceContextProvider
        resource={resource}
        resourceAction={ActionList.list}
        filter={{ status: "A" }}
      />
    )
    await screen.findByText("Idea A")

    act(() => screen.getByText("Filter on B").click())
    await screen.findByText("Idea B")

    getCollection.mockClear()
    act(() => resource.onChange.publish({ data: {}, action: ActionList.update }))

    await waitFor(() => expect(getCollection).toHaveBeenCalled())
    expect(
      getCollection.mock.calls.every(([filter]) => filter?.status === "B")
    ).toBe(true)
    expect(await screen.findByText("Idea B")).toBeInTheDocument()
    expect(screen.queryByText("Idea A")).toBeNull()
  })

  it("reads it once, however many rows carry a button", async () => {
    const { resource, getCollection } = createIdeas()
    render(
      <ViewResourceContextProvider
        resource={resource}
        resourceAction={ActionList.list}
        filter={{ status: "A" }}
      />
    )
    await screen.findByText("Idea A")

    getCollection.mockClear()
    act(() => resource.onChange.publish({ data: {}, action: ActionList.update }))

    await waitFor(() => expect(getCollection).toHaveBeenCalled())
    expect(getCollection).toHaveBeenCalledTimes(1)
  })
})
