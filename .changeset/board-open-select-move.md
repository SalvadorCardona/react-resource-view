---
"react-resource-view": minor
---

Open a card of a board, select several and move them together, instead of only
dragging one card at a time onto a column.

- `behavior.openRecordIn` (`"drawer"`, `"popup"` or `"window"`) makes the whole
  card clickable — hover and focus states, Enter from the keyboard — and opens
  the record's `read` view: in a panel on the right or a dialog, both written
  into the URL as a child view of the list (`…/tasks/list/tasks/read/12`, which
  `parseLink` now reads), so the link is shareable and Back closes it; or on
  the record's own page, through `generateLink`. The panel has a way to edit the
  record, traps the focus and gives it back to the card.
- A button, a link, a menu, a checkbox or a drag handle drawn in a card keeps
  its click, without any `stopPropagation`: the card only opens on a click that
  lands on none of them (`data-card-control` marks anything else), and not when
  text is being selected.
- Cards can be selected — checkbox, Ctrl/Cmd+click, Shift+click for a range, a
  long press on a phone, Escape to clear — and a bar offers "Move to…",
  `behavior.bulkActions` and "Deselect all". Dragging a selected card moves the
  whole selection under an "N cards" preview. Each record is updated through
  the repository and drawn in its new column at once; one that fails goes back,
  and a message says how many could not be moved. `behavior.selectable: false`
  turns selection off.
- Each column scrolls on its own, and an empty column shows where to drop.
