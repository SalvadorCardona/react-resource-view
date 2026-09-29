---
"react-resource-view": patch
---

Keep the horizontal sub-view tab bar within its column when
`subViewResource.viewComponent` draws a left column beside it. The tabs' grid
track grew to the width of the whole row of tabs, so the bar never scrolled:
the last tabs were cut off and the page itself overflowed to the right. The bar
now scrolls sideways as it does without a left column; the vertical menu and
records without a left column render as before.
