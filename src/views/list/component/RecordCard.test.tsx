import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  CurrentResourceContext,
  CurrentViewResourceContext,
} from "@/provider/ViewResourceContextProvider"
import { RecordCard } from "@/views/list/component/RecordCard"

/**
 * The foot of a card — a separator and the row's actions — used to be drawn
 * whenever the layout asked for actions, whether or not the resource permitted
 * any: a card with nothing to do ended on a stray line and an empty strip.
 */

// Drawing the buttons themselves would pull routing into a test about whether
// there is a foot at all. Only the buttons are stubbed: which actions there
// are is still read from the resource, as in the real thing.
vi.mock("@/action/ListResourceViewButton", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  default: () => <div data-testid="actions" />,
}))

const row = { data: { "@id": "/api/contacts/1", name: "Ada" } } as any

function renderCard(
  resource: Record<string, unknown>,
  withActions: boolean | undefined = true
) {
  const { container } = render(
    <CurrentResourceContext
      value={{ resource } as unknown as CurrentViewResourceContext}
    >
      <RecordCard row={row} withActions={withActions}>
        Ada
      </RecordCard>
    </CurrentResourceContext>
  )

  return container
}

describe("the foot of a record card", () => {
  it("holds the row's actions when the resource permits one", () => {
    const container = renderCard({ canUpdate: true, canDelete: false })

    expect(screen.getByTestId("actions")).toBeInTheDocument()
    expect(container.querySelector(".border-t")).not.toBeNull()
  })

  it("is left out, separator included, when no action is permitted", () => {
    const container = renderCard({ canUpdate: false, canDelete: () => false })

    expect(screen.queryByTestId("actions")).toBeNull()
    expect(container.querySelector(".border-t")).toBeNull()
  })

  it("is left out when the layout asks for no actions", () => {
    const container = renderCard({ canUpdate: true, canDelete: true }, false)

    expect(screen.queryByTestId("actions")).toBeNull()
    expect(container.querySelector(".border-t")).toBeNull()
  })
})
