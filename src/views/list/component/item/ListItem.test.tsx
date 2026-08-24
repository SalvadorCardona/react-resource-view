import { describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

vi.mock("@/views/list/component/ListPagination", () => ({
  default: () => null,
}))

vi.mock("@/views/list/component/DefaultRowComponent", () => ({
  DefaultRowComponent: () => <div data-testid="row" />,
}))

const { ListItem } =
  await import("@/views/list/component/item/ListItem")

describe("ListItem", () => {
  it("sets no fixed height and caps the viewport height", () => {
    const { container } = render(<ListItem rows={[]} />)

    const root = container.querySelector('[data-slot="scroll-area"]')!
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]')!

    // Une hauteur fixe réservait 300px même pour un seul item, ce qui
    // repoussait le bouton « Continuer » hors de l'écran sur mobile.
    expect(root.className).not.toMatch(/(^|\s)h-\[/)
    expect(viewport).toHaveClass("max-h-[300px]")
  })
})
