---
"react-resource-view": patch
---

Light the sidebar entry of the page `AdminLayout` opens on, and unfold the group of the page on screen, instead of leaving the reader to find either.

A scope opened bare — `/playground`, `?view=admin` — shows the page its
`defaultViewResourceContextParams` name, but its URL names none, so no entry
was lit until the reader clicked on one. `useIsActiveItemMenu` now takes that
default view, and `AdminLayout` hands it the scope's.

A sub-entry on screen now unfolds its group, even one the reader had folded on
an earlier visit, and marks it with the accent colour, without the background
the page itself carries. The entry on screen also carries `aria-current="page"`.
