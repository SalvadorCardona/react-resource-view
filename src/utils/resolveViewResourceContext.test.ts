import { describe, expect, it } from "vitest"
import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { ActionList } from "react-data-form"
import { createViewResource } from "@/utils/createViewResource"

const resource = createViewResource("calendar_events", {
  storage: "local",
  views: { list: { filters: { initial: { timeScope: "upcoming" } } } },
})

describe("resolveViewResourceContext", () => {
  it("applies the list's initial filters when the URL carries none", () => {
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

  it("fills the URL filter with the initial keys it lacks", () => {
    const context = resolveViewResourceContext({
      resource,
      resourceAction: ActionList.list,
      filter: { title: "vaccin" },
    })

    expect(context.filter).toEqual({ timeScope: "upcoming", title: "vaccin" })
  })

  it("leaves the filter untouched for a list without initial filters", () => {
    const context = resolveViewResourceContext({
      resource: createViewResource("calendar_events_plain", { storage: "local" }),
      resourceAction: ActionList.list,
      filter: { title: "vaccin" },
    })

    expect(context.filter).toEqual({ title: "vaccin" })
  })
})
