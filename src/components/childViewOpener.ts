/**
 * What opened the child view on screen, kept between the click that wrote it
 * into the URL and the dialog that reads it back.
 *
 * The two never meet: the card navigates, the router re-renders, and the
 * dialog is drawn by the view the card sits in. Two things have to cross:
 * - the element to give the focus back to once the dialog closes — a dialog
 *   opened by a URL has no trigger of its own to return it to;
 * - whether the dialog's URL was pushed from the page under it. If it was,
 *   closing it is the browser's Back, so the history holds one entry per
 *   opening, not two; if the URL was shared or reloaded, there is nothing
 *   behind it to go back to, and closing navigates to the parent instead.
 *
 * Both are kept against the record they were written for, not handed over
 * once: on its way to the new URL the host may draw the dialog, drop it and
 * draw it again — a scope suspending, say — and each of them has to find them.
 */
export interface ChildViewOpenerInterface {
  element: HTMLElement | null
  pushed: boolean
}

let opener: ChildViewOpenerInterface & { record?: string } = {
  element: null,
  pushed: false,
}
let mountedDialogs = 0

const recordKey = (resourceId: string, id: unknown) => `${resourceId}/${String(id)}`

export function rememberChildViewOpener(
  element: HTMLElement | null,
  resourceId: string,
  id: unknown
): void {
  opener = { element, pushed: true, record: recordKey(resourceId, id) }
}

/** What opened the child view showing this record, if a card of the page did. */
export function readChildViewOpener(
  resourceId: string,
  id: unknown
): ChildViewOpenerInterface {
  return opener.record === recordKey(resourceId, id)
    ? opener
    : { element: null, pushed: false }
}

/** Forgets it, once the child view has been closed. */
export function forgetChildViewOpener(): void {
  opener = { element: null, pushed: false }
}

/**
 * Counts the child views on screen, so the focus is only given back once the
 * last one is gone — not between a dialog dropped and the same drawn again.
 */
export function trackChildViewMounted(): () => void {
  mountedDialogs++
  return () => {
    mountedDialogs--
  }
}

export function hasChildViewMounted(): boolean {
  return mountedDialogs > 0
}
