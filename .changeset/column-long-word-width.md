---
"react-resource-view": patch
---

Keep a column of the columns view at its width when one of its cards holds a
long unbreakable word (a path, a URL, an identifier). As a flex item, the
column was never narrower than its widest content: once a parent sized the
columns, it grew around the word and slid under its neighbours. The column is
now `min-w-0` and the content of a record card `break-words`, so the word wraps
inside the card instead.
