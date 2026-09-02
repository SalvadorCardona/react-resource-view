---
"react-resource-view": patch
---

Make a form opening in a dialog behave like one.

`behavior: { openIn: "popup" }` drew a dialog with no name, introduced by
whatever sentence the *list* had been given — every action inherits the
resource's `view`, description included — and a creation made from it
navigated straight out of the page the dialog sat on, taking the list, its
filters and its page with it.

- A popup is now titled by the view it opens, which assistive technology
  announces and a reader can read; the list's description stays on the list.
- After a creation in a popup nothing navigates: the dialog closes on the
  resource's `onChange` and the list refreshes underneath. On a screen of its
  own the move to the new record's edit view is unchanged — and now builds its
  link in the resource's own scope, instead of walking out of the area it was
  made in.
- A view an action does not name is called after that action: a resource whose
  list is "Coffee beans" edits "Edit — Coffee beans" rather than a second
  "Coffee beans". A name the action declares is left alone.
- The delete confirmation speaks English — "Supprimer ?", "Annuler" and the
  error toast were shipped in French and never went through `react-mini-i18n` —
  and no longer repeats the name of the view that frames it.
- Cards of one row line their actions up on the bottom edge, instead of leaving
  each set of buttons wherever its record happened to end.
