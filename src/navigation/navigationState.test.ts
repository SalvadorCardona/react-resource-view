import { afterEach, describe, expect, it } from "vitest"
import {
  isNavigationActive,
  markViewLoading,
  resetNavigationState,
  setNavigationLocation,
  setRouterPending,
  startNavigation,
} from "@/navigation/navigationState"

afterEach(() => resetNavigationState())

describe("the navigation state", () => {
  it("lasts from the click until the location changes", () => {
    setNavigationLocation("/admin/tasks/list")
    startNavigation("/admin/tasks/read/1")
    expect(isNavigationActive()).toBe(true)

    setNavigationLocation("/admin/tasks/read/1")
    expect(isNavigationActive()).toBe(false)
  })

  it("lasts until the new view has loaded", () => {
    setNavigationLocation("/admin/tasks/list")
    startNavigation("/admin/tasks/read/1")

    const done = markViewLoading()
    setNavigationLocation("/admin/tasks/read/1")
    expect(isNavigationActive()).toBe(true)

    done()
    expect(isNavigationActive()).toBe(false)
  })

  it("is not started by a view loading on its own", () => {
    const done = markViewLoading()
    expect(isNavigationActive()).toBe(false)
    done()
  })

  it("is not started by a link to the page on screen", () => {
    startNavigation(window.location.pathname + window.location.search)
    expect(isNavigationActive()).toBe(false)
  })

  it("is not started by a link to another site", () => {
    startNavigation("https://example.com/elsewhere")
    expect(isNavigationActive()).toBe(false)
  })

  it("follows the router, then the view it leads to", () => {
    setRouterPending(true)
    expect(isNavigationActive()).toBe(true)

    const done = markViewLoading()
    setRouterPending(false)
    expect(isNavigationActive()).toBe(true)

    done()
    expect(isNavigationActive()).toBe(false)
  })
})
