import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"
import { configurePorts, getPorts } from "@/ports"
import MetaResourceComponent from "@/components/MetaResource"
import { CurrentResourceContext } from "@/provider/ViewResourceContextProvider"

/**
 * Page metadata is the one thing a crawler always reads, so it has to survive
 * a server render — where there is no `window` to ask for the current URL.
 */
describe("MetaResourceComponent", () => {
  beforeEach(() => {
    configurePorts({
      appName: "Animalink",
      appUrl: "https://example.test",
      description: "Book an appointment",
      navigation: {
        ...getPorts().navigation,
        useLocation: () => ({ pathname: "/annuaire", searchStr: "" }),
      },
    })
  })

  it("builds its canonical from the router, not from the address bar", () => {
    const originalWindow = globalThis.window

    // @ts-expect-error — reproducing a server, where there is no window
    delete globalThis.window

    try {
      const html = renderToStaticMarkup(
        <CurrentResourceContext.Provider
          value={{ view: { name: "Annuaire" } } as never}
        >
          <MetaResourceComponent />
        </CurrentResourceContext.Provider>
      )

      expect(html).toContain('href="https://example.test/annuaire"')
      expect(html).toContain("<title>Annuaire · Animalink</title>")
    } finally {
      globalThis.window = originalWindow
    }
  })
})
