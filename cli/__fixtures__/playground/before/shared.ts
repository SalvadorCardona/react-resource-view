/**
 * How the two resources made of blocks — the posts and the CVs — open their
 * forms.
 *
 * A block array is a long form — the palette, one card per block, dragged
 * into order — so it gets the sliding panel rather than a centred dialog: see
 * `openIn: "drawer"` in the resource-view docs. An account's form opens there
 * too, over the account's page: the panel leaves the card and the tabs in
 * view, and they are what the save redraws. Delete stays a small popup, like
 * the rest of the playground.
 */
export const DRAWER = {
  behavior: { openIn: "drawer", closeAfterUpdate: true },
} as const

export const POPUP = {
  behavior: { openIn: "popup", closeAfterUpdate: true },
} as const

/**
 * How wide a view is drawn under `AdminLayout`: the tasks board, calendar and
 * timeline take the whole page, and the forms of a task keep the column every
 * other screen sits in — see `fullWidth` in the resource-view docs.
 *
 * Spread rather than written out, like the two above: `fullWidth` arrived in
 * react-resource-view 0.11, and a spread keeps these declarations compiling
 * against whichever release the site is installed on.
 */
export const FULL_WIDTH = { fullWidth: true } as const

export const NARROW = { fullWidth: false } as const
