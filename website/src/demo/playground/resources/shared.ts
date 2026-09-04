/**
 * How every form of the administration opens: over the list it was started
 * from, rather than on a screen of its own.
 *
 * A back office is a place where records are dispatched one after another —
 * approve this comment, fix that price, invite that user. Leaving the list to
 * fill in three fields, and coming back to look for where one was, costs more
 * than the form itself; the dialog keeps the list underneath and hands it back
 * untouched, filters and page included.
 *
 * `closeAfterUpdate` is what makes a creation end there. Without it the form
 * moves on to the new record's edit screen — the right thing on a screen of
 * its own, where the alternative is an empty "New user" nobody asked to see
 * again, and the wrong thing here: the list the dialog was opened over is
 * exactly where the next record is created from.
 */
export const POPUP = {
  behavior: { openIn: "popup", closeAfterUpdate: true },
} as const
