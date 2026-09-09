---
"react-resource-view": minor
---

Give a list a header of its own.

The create button, the export button and the layout switcher used to be stacked
above the rows as three loose controls, and the resource's `icon` — already used
by the menu and by the sub-view tabs — appeared nowhere on the screen it belongs
to. They are now one line: the icon, the view's `name` and its `description` on
the left, the layout switcher beside them, the actions on the right.

Nothing is declared for it: a resource that names no icon simply shows none, and
a list nested inside another view — a sub-view tab — leaves the naming to
whatever contains it. The filter bar is untouched.
