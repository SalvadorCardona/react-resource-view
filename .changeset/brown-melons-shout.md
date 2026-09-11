---
"react-resource-view": patch
---

Keep a list header on one line when its description is long.

The header laid the name, the layout switcher and the create button side by
side, each free to wrap on its own. A resource introduced by a full sentence
took the whole width for it, and the create button was pushed alone onto the
line below, floating under the tabs.

The text now yields instead of pushing — it is the flexible part of the line —
and the switcher, the export and the create button form a single bar, so the
width that does run out takes the whole bar down, never one button of it.
