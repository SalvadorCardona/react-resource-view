---
"react-resource-view": patch
---

fix(views): the table keeps its row actions in sight when it is wider than the screen, instead of pushing them out of view

- The actions column and its header are `position: sticky` on the right edge, opaque, with a shadow on their left; the buttons are at least 40 px wide and tall. A fade on the table's edges tells that columns are hidden on that side.
- `layout.table({ stickyActions: false })` leaves the actions in the flow; `layout.table({ stickyFirstColumn: true })` also pins the first column to the left.
