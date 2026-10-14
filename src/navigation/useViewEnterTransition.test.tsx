import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ActionList } from "react-data-form"
import ResourceViewProvider from "@/provider/ResourceViewProvider"
import { ResourceConfigInterface } from "@/ResourceConfig"
import { createViewResource } from "@/utils/createViewResource"

const page = createViewResource("enter_page", {
  storage: "local",
  views: { read: { components: { view: () => <h2>Page</h2> } } },
})

const renderPage = (configuration?: ResourceConfigInterface) =>
  render(
    <ResourceViewProvider
      viewResourceContextParams={{
        scope: "enter",
        resourceId: "enter_page",
        resourceAction: ActionList.read,
      }}
      configuration={{ resources: [page], defaultScope: "enter", ...configuration }}
    />
  )

const animate = vi.fn()
const matchMedia = window.matchMedia

/** Makes `prefers-reduced-motion: reduce` match, or not. */
function prefersReducedMotion(reduce: boolean) {
  window.matchMedia = (query: string) =>
    ({
      ...matchMedia(query),
      matches: reduce && query === "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as MediaQueryList
}

beforeEach(() => {
  animate.mockReset()
  HTMLElement.prototype.animate = animate
})

afterEach(() => {
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate
  window.matchMedia = matchMedia
})

describe("the view's entrance", () => {
  it("fades the view in, sliding it up a little", async () => {
    prefersReducedMotion(false)
    renderPage()
    await screen.findByText("Page")

    expect(animate).toHaveBeenCalledTimes(1)
    const [keyframes, options] = animate.mock.calls[0]
    expect(keyframes[0]).toMatchObject({ opacity: 0, transform: "translateY(4px)" })
    expect(options.duration).toBeGreaterThanOrEqual(150)
    expect(options.duration).toBeLessThanOrEqual(200)
  })

  it("does not move under prefers-reduced-motion: reduce", async () => {
    prefersReducedMotion(true)
    renderPage()
    await screen.findByText("Page")

    expect(animate).toHaveBeenCalledTimes(1)
    const [keyframes] = animate.mock.calls[0]
    for (const keyframe of keyframes)
      expect(keyframe).not.toHaveProperty("transform")
  })

  it("is not played with viewTransition: false", async () => {
    prefersReducedMotion(false)
    renderPage({ viewTransition: false })
    await screen.findByText("Page")

    expect(animate).not.toHaveBeenCalled()
  })
})
