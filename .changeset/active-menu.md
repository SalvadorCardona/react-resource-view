---
"react-resource-view": patch
---

`isActiveItemMenu` now works in query mode.

It compared `window.location.pathname` against the entry's href. In query mode
the context lives in the query string, so the pathname is the same for every
page and no entry was ever marked active.
