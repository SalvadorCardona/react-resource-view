---
"react-resource-view": patch
---

Fold the admin sidebar away, and keep a menu entry lit on the page it points at.

Two things `AdminLayout` got wrong on the screen it is mostly read on. The top
bar's button only ever opened the mobile drawer, so on a wide screen — the one
place it is shown — pressing it did nothing; it now folds the sidebar column
away and back.

And a menu entry was matched against the address bar as a string, which held
only while the URL was exactly the one the entry was built from: opening a
record of a resource turned its entry off, and in query mode an application
whose views are mounted somewhere other than the configured `basePath` never
lit any entry at all. The comparison is now made context by context — scope,
resource, record — so an entry pointing at a list stays lit for everything
inside that list, while two entries on the same resource (its list, its
creation form) stay distinguishable.
