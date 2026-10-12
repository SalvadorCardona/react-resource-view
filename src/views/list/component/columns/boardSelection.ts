/**
 * The selection of a board, as plain functions over the ids of its cards: what
 * a click, a Ctrl/Cmd+click and a Shift+click do to it, kept apart from the
 * events that trigger them.
 */

/** Adds the card if it was not selected, takes it out if it was. */
export function toggleSelection(selected: string[], id: string): string[] {
  return selected.includes(id)
    ? selected.filter((current) => current !== id)
    : [...selected, id]
}

/**
 * Adds every card between the anchor — the card last clicked — and this one,
 * both included, in the order the column shows them.
 *
 * A range only means something within a column: with no anchor, or an anchor
 * in another column, the card is toggled on its own.
 */
export function selectRange(
  selected: string[],
  columnIds: string[],
  anchor: string | null,
  id: string
): string[] {
  const from = anchor ? columnIds.indexOf(anchor) : -1
  const to = columnIds.indexOf(id)
  if (from === -1 || to === -1) return toggleSelection(selected, id)

  const range = columnIds.slice(Math.min(from, to), Math.max(from, to) + 1)

  return [...selected, ...range.filter((current) => !selected.includes(current))]
}

/**
 * What a drag carries: the whole selection when the card picked up is part of
 * it, that card alone otherwise — dragging a card left out of the selection
 * moves that card, not the others.
 */
export function draggedIds(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected : [id]
}
