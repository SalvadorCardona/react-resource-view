/**
 * How the pages and profiles resources open their forms.
 *
 * A block array is a long form — the palette, one card per block, dragged
 * into order — so it gets the sliding panel rather than a centred dialog: see
 * `openIn: "drawer"` in the resource-view docs. Delete stays a small popup,
 * like the rest of the playground.
 */
export const DRAWER = {
  behavior: { openIn: "drawer", closeAfterUpdate: true },
} as const

export const POPUP = {
  behavior: { openIn: "popup", closeAfterUpdate: true },
} as const
