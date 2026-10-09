import { describe, expect, it } from "vitest"
import capitalizeFirst from "@/utils/capitalizeFirst"

describe("capitalizeFirst", () => {
  it("upper-cases the first letter and keeps the rest", () => {
    expect(capitalizeFirst("vue d'ensemble")).toBe("Vue d'ensemble")
    expect(capitalizeFirst("liste DES Items")).toBe("Liste DES Items")
  })

  it("handles accented and astral characters", () => {
    expect(capitalizeFirst("énergie")).toBe("Énergie")
    expect(capitalizeFirst("île")).toBe("Île")
    expect(capitalizeFirst("𐐨x")).toBe("𐐀x")
  })

  it("leaves an empty or non-letter label alone", () => {
    expect(capitalizeFirst("")).toBe("")
    expect(capitalizeFirst("3 colonnes")).toBe("3 colonnes")
  })
})
