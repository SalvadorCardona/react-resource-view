import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { A } from "./prose"

describe("A", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("prefixes site paths with the base the site is served from", () => {
    vi.stubEnv("BASE_URL", "/react-resource-view/")
    render(<A href="/docs/form">forms</A>)

    expect(screen.getByRole("link", { name: "forms" })).toHaveAttribute(
      "href",
      "/react-resource-view/docs/form"
    )
  })

  it("keeps the query string of a site path", () => {
    vi.stubEnv("BASE_URL", "/react-resource-view/")
    render(<A href="/playground/builder?kit=email">builder</A>)

    expect(screen.getByRole("link", { name: "builder" })).toHaveAttribute(
      "href",
      "/react-resource-view/playground/builder?kit=email"
    )
  })

  it("leaves anchors and external links alone", () => {
    vi.stubEnv("BASE_URL", "/react-resource-view/")
    render(
      <>
        <A href="#below">anchor</A>
        <A href="https://example.com/x">external</A>
      </>
    )

    expect(screen.getByRole("link", { name: "anchor" })).toHaveAttribute(
      "href",
      "#below"
    )
    expect(screen.getByRole("link", { name: "external" })).toHaveAttribute(
      "href",
      "https://example.com/x"
    )
  })
})
