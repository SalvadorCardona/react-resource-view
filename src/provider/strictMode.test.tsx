import { StrictMode } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ActionList } from "react-data-form"
import { createViewResource } from "@/utils/createViewResource"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

/**
 * React's strict mode mounts an effect, cleans it up and mounts it again in
 * one go. The second mount used to share the request of the first — which its
 * own cleanup had invalidated — and the list stayed empty.
 */

function Titles() {
  const { data } = useCurrentViewResourceContext()
  const items = (data as { member?: { title: string }[] } | undefined)?.member ?? []

  return (
    <ul>
      {items.map((item) => (
        <li key={item.title}>{item.title}</li>
      ))}
    </ul>
  )
}

afterEach(() => localStorage.clear())

describe("a list under React's strict mode", () => {
  it("shows the rows of its first request", async () => {
    localStorage.setItem(
      "strict_articles",
      JSON.stringify({
        "@id": "strict_articles",
        "@type": "Collection",
        member: [{ "@id": "/articles/1", id: "1", title: "First article" }],
        totalItems: 1,
      })
    )
    const resource = createViewResource("strict_articles", {
      storage: "local",
      components: { view: Titles },
    })

    render(
      <StrictMode>
        <ViewResourceContextProvider
          resource={resource}
          resourceAction={ActionList.list}
        />
      </StrictMode>
    )

    expect(await screen.findByText("First article")).toBeInTheDocument()
  })
})
