---
"react-resource-view": patch
---

Keep the horizontal sub-view bar inside the page and level with the side column when `subViewResource` has one, instead of pushing the page sideways and starting 4rem below the column.

The sub-view track was a bare `1fr`, which is never narrower than what it holds —
and the bar is as wide as all its tabs, a table in a tab as wide as its columns.
The track is now `minmax(0, 1fr)` and the tabs container `min-w-0`, so the bar
scrolls inside the width left beside the column, as it already did without one.

The bar was also meant to stay pinned under the top bar while a long sub-view
scrolls, but the scroll area's root sets `position: relative` inline, which beat
its `sticky` class: the bar never stuck, and its `top` offset moved it down
instead. The bar is now pinned from a wrapper of its own.
