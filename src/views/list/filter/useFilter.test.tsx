import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"

const setFilter = vi.fn()

const resource = {
  "@id": "admin_company_members",
  views: {
    list: {
      formFilter: {
        inputs: {
          name: { label: "Nom" },
        },
      },
    },
  },
}

// Le contexte porte un filtre injecté (`company`, posé par `onInitViewResource`
// d'une sous-vue) en plus du filtre saisi par l'utilisateur (`name`).
vi.mock("@/provider/useCurrentViewResourceContext", () => ({
  default: () => ({
    resource,
    filter: { company: "/api/companies/42", name: "dupont" },
    setFilter,
  }),
}))

const { default: useFilter } =
  await import("@/views/list/filter/useFilter")

describe("useFilter", () => {
  it("exposes the filters injected by the context on top of what was typed", () => {
    const { result } = renderHook(() => useFilter({}))

    expect(result.current.filter).toEqual({
      company: "/api/companies/42",
      name: "dupont",
    })
  })

  it("treats only the form's declared filters as typed", () => {
    const { result } = renderHook(() => useFilter({}))

    // `company` est un input généré : il ne doit pas faire croire à
    // l'utilisateur qu'une recherche est en cours.
    expect(result.current.filterIsEmpty).toBe(false)
  })

  it("keeps the injected filters when the search is cleared", () => {
    const { result } = renderHook(() => useFilter({}))

    act(() => {
      result.current.resetFilter({})
    })

    // Sans cela, « Nettoyer la recherche » listerait les membres de toutes les
    // entreprises depuis la fiche entreprise de l'admin.
    expect(setFilter).toHaveBeenLastCalledWith({ company: "/api/companies/42" })
  })
})
