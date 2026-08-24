import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"

const setFilter = vi.fn()

const resource = {
  "@id": "calendar_events",
  views: {
    list: {
      formFilter: {
        inputs: {
          title: { label: "Recherche" },
          timeScope: { label: "Trier" },
        },
      },
      defaultFilter: { timeScope: "upcoming" },
    },
  },
}

// Le filtre par défaut de la vue est déjà posé sur le contexte (résolu au
// montage par `resolveViewResourceContext`), l'utilisateur n'a rien saisi.
vi.mock("@/provider/useCurrentViewResourceContext", () => ({
  default: () => ({
    resource,
    filter: { timeScope: "upcoming" },
    setFilter,
  }),
}))

const { default: useFilter } =
  await import("@/views/list/filter/useFilter")

describe("useFilter with a view-level defaultFilter", () => {
  it("pre-fills the form with the default filter", () => {
    const { result } = renderHook(() => useFilter({}))

    expect(result.current.filter).toEqual({ timeScope: "upcoming" })
  })

  it("does not count the default filter as a user search", () => {
    const { result } = renderHook(() => useFilter({}))

    // Sinon « Nettoyer la recherche » serait proposé en permanence, alors que
    // la liste est dans son état de repos.
    expect(result.current.filterIsEmpty).toBe(true)
  })

  it("counts a value picked by the user as a search", () => {
    const { result } = renderHook(() => useFilter({}))

    act(() => {
      result.current.updateFilter({ timeScope: "past" })
    })

    expect(result.current.filterIsEmpty).toBe(false)
  })

  it("restores the default filter when the search is cleared", () => {
    const { result } = renderHook(() => useFilter({}))

    act(() => {
      result.current.updateFilter({ title: "vaccin", timeScope: "all" })
    })
    act(() => {
      result.current.resetFilter({})
    })

    // Sans cela, l'agenda repartirait sans périmètre temporel alors que le
    // bouton « Trier » afficherait « Événements à venir ».
    expect(setFilter).toHaveBeenLastCalledWith({ timeScope: "upcoming" })
  })
})
