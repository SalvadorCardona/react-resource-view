import { afterEach, describe, expect, it } from "vitest"
import {
  hasTextSelectionIn,
  isCardControlTarget,
} from "@/views/list/component/columns/cardClick"

function card(html: string): HTMLElement {
  const element = document.createElement("div")
  element.setAttribute("role", "group")
  element.tabIndex = 0
  element.innerHTML = html
  document.body.appendChild(element)
  return element
}

afterEach(() => {
  document.body.innerHTML = ""
  window.getSelection()?.removeAllRanges()
})

describe("a click on a card", () => {
  it("belongs to the card when it lands on its text", () => {
    const element = card("<p><strong>Roast</strong> the new lot</p>")
    expect(isCardControlTarget(element.querySelector("strong"), element)).toBe(false)
    expect(isCardControlTarget(element, element)).toBe(false)
  })

  it.each([
    ["a button", "<button><svg></svg><span>Edit</span></button>", "span"],
    ["a link", "<a href='/x'><span>Open</span></a>", "span"],
    ["a checkbox", "<span role='checkbox'><svg></svg></span>", "svg"],
    ["a menu item", "<div role='menuitem'><span>Archive</span></div>", "span"],
    ["an input", "<label>Done <input type='checkbox'></label>", "input"],
    ["a drag handle", "<span data-card-control><svg></svg></span>", "svg"],
  ])("belongs to %s drawn in the card", (_, html, selector) => {
    const element = card(html)
    expect(isCardControlTarget(element.querySelector(selector), element)).toBe(true)
  })

  it("belongs to what a portal drew outside the card", () => {
    const element = card("<p>Roast</p>")
    const menu = document.createElement("div")
    document.body.appendChild(menu)
    expect(isCardControlTarget(menu, element)).toBe(true)
  })

  it("is a selection of text when some of the card's text is selected", () => {
    const element = card("<p>Roast the new lot</p>")
    expect(hasTextSelectionIn(element)).toBe(false)

    const range = document.createRange()
    range.selectNodeContents(element.querySelector("p")!)
    window.getSelection()!.addRange(range)

    expect(hasTextSelectionIn(element)).toBe(true)
  })
})
