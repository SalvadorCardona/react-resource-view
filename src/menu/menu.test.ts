import { beforeEach, describe, expect, it } from "vitest"
import { configurePorts, getPorts } from "@/ports"
import { isActiveItemMenu, useIsActiveItemMenu } from "@/menu/menu"

/**
 * Highlighting the entry that matches the current page.
 *
 * `useIsActiveItemMenu` is a hook only so it can read the navigation port; it
 * calls no React hook of its own, so these tests invoke it directly.
 */
describe("useIsActiveItemMenu", () => {
  beforeEach(() => {
    configurePorts({
      routing: { mode: "path", param: "view", basePath: "" },
      navigation: {
        ...getPorts().navigation,
        useLocation: () => ({
          pathname: "/annuaire/veterinaire",
          searchStr: "?page=2",
        }),
      },
    })
  })

  it("marks the entry the current page sits under", () => {
    const isActive = useIsActiveItemMenu()

    expect(isActive({ name: "Annuaire", href: "/annuaire" })).toBe(true)
    expect(isActive({ name: "Aide", href: "/aide" })).toBe(false)
  })

  it("reads the location from the router rather than the address bar", () => {
    // The regression this guards: the menu read `window.location` directly,
    // which threw while rendering on a server. React then abandoned the whole
    // server render in favour of the browser, quietly, leaving an empty page
    // behind for anything that only reads the markup.
    const originalWindow = globalThis.window

    // @ts-expect-error — reproducing a server, where there is no window
    delete globalThis.window

    try {
      expect(useIsActiveItemMenu()({ name: "Annuaire", href: "/annuaire" })).toBe(
        true
      )
    } finally {
      globalThis.window = originalWindow
    }
  })

  it("takes the query string into account in query mode", () => {
    configurePorts({ routing: { mode: "query", param: "view", basePath: "" } })

    const isActive = useIsActiveItemMenu()

    expect(isActive({ name: "Page 2", href: "/annuaire/veterinaire?page=2" })).toBe(
      true
    )
    expect(isActive({ name: "Page 3", href: "/annuaire/veterinaire?page=3" })).toBe(
      false
    )
  })

  it("reports nothing active off the browser, where isActiveItemMenu cannot look", () => {
    const originalWindow = globalThis.window

    // @ts-expect-error — reproducing a server, where there is no window
    delete globalThis.window

    try {
      expect(isActiveItemMenu({ name: "Annuaire", href: "/annuaire" })).toBe(false)
    } finally {
      globalThis.window = originalWindow
    }
  })
})
