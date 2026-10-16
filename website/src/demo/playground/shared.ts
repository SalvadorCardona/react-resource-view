/**
 * How the two resources made of blocks — the posts and the CVs — open their
 * forms.
 *
 * A block array is a long form — the palette, one card per block, dragged
 * into order — so it gets the sliding panel rather than a centred dialog: see
 * `open: "drawer"` in the resource-view docs. An account's form opens there
 * too, over the account's page: the panel leaves the card and the tabs in
 * view, and they are what the save redraws. Delete stays a small dialog, like
 * the rest of the playground.
 */
export const DRAWER = { open: "drawer" } as const

export const POPUP = { open: "dialog" } as const
