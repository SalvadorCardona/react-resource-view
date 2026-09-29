---
"react-resource-view": minor
---

Give a board, a calendar or a wide table the whole page in `AdminLayout`, instead of the column every view was squeezed into.

A view now takes `fullWidth`. Set on a resource's `view`, it covers every action
of the resource; on one of `views`, that action; on a list variant built by a
`*ViewOptionFactory`, that variant only. The most specific declaration wins, so
a resource drawn full width keeps its forms narrow with
`views: { update: { fullWidth: false } }`, and a board can be the one wide
layout of a list whose table stays in the column. `AdminLayout` drops its width
constraint for such a view and keeps its side margins; nothing changes for a
view that does not ask.

`isFullWidthView` resolves the option for the view on screen, for a
`decoratorComponent` of one's own that wants to honour it too.
