/**
 * Whether a click on a card belongs to the card or to something drawn in it.
 *
 * A card holds whatever its row component draws — a link, a menu, a button —
 * plus the board's own checkbox. Each of them keeps its click: rather than
 * every one of them stopping the event on its way up, which a consumer's
 * component would forget, the card looks at where the click landed and lets
 * it through when it landed in a control.
 */

const CONTROLS = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='button']",
  "[role='link']",
  "[role='checkbox']",
  "[role='switch']",
  "[role='menu']",
  "[role='menuitem']",
  "[role='option']",
  "[role='tab']",
  "[role='slider']",
  // An escape hatch for anything else a row component wants kept to itself.
  "[data-card-control]",
].join(",")

/**
 * True when the click landed on a control inside the card — or outside the
 * card's own markup altogether: React bubbles the events of a portal through
 * the component tree, so a menu opened from a card and drawn at the end of the
 * page would otherwise open the card too.
 */
export function isCardControlTarget(
  target: EventTarget | null,
  card: HTMLElement
): boolean {
  if (!(target instanceof Element)) return false
  if (!card.contains(target)) return true

  const control = target.closest(CONTROLS)

  return control !== null && control !== card && card.contains(control)
}

/** True when the user has just selected some of the card's text. */
export function hasTextSelectionIn(card: HTMLElement): boolean {
  const selection = typeof window !== "undefined" ? window.getSelection() : undefined
  if (!selection || selection.isCollapsed || !selection.toString()) return false

  return card.contains(selection.anchorNode) || card.contains(selection.focusNode)
}
