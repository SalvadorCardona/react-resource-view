import { describe, expect, it } from "vitest"
import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { ActionList } from "react-data-form"
import { ViewResourceInterface } from "@/ViewResourceInterface"

const resource = {
  "@id": "calendar_events",
  views: {
    list: {
      defaultFilter: { timeScope: "upcoming" },
    },
  },
} as unknown as ViewResourceInterface

describe("resolveViewResourceContext", () => {
  it("applies the view's default filter when the URL carries none", () => {
    // Le filtre doit être posé dès la résolution du contexte : c'est lui qui
    // part avec la première requête de la liste.
    const context = resolveViewResourceContext({
      resource,
      resourceAction: ActionList.list,
    })

    expect(context.filter).toEqual({ timeScope: "upcoming" })
  })

  it("lets the URL filter win, key by key", () => {
    const context = resolveViewResourceContext({
      resource,
      resourceAction: ActionList.list,
      filter: { timeScope: "past", title: "vaccin" },
    })

    expect(context.filter).toEqual({ timeScope: "past", title: "vaccin" })
  })

  it("fills the URL filter with the default keys it lacks", () => {
    const context = resolveViewResourceContext({
      resource,
      resourceAction: ActionList.list,
      filter: { title: "vaccin" },
    })

    expect(context.filter).toEqual({ timeScope: "upcoming", title: "vaccin" })
  })

  it("leaves the filter untouched for a view without a default one", () => {
    const context = resolveViewResourceContext({
      resource: { views: { list: {} } } as unknown as ViewResourceInterface,
      resourceAction: ActionList.list,
      filter: { title: "vaccin" },
    })

    expect(context.filter).toEqual({ title: "vaccin" })
  })
})
