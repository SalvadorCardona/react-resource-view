---
"react-resource-view": patch
---

Keep what the user picks while the list is fetching. A request landing used to
write the whole view context back — the one captured when it left — so a layout
chosen from the variant tabs, or a filter applied, was reverted a few
milliseconds later. Requests now bring back rows only, `setViewResource` accepts
an updater like React's own setters, and the variant tabs are controlled, so the
highlighted tab is always the layout on screen.

The timeline's footer counts are translatable, and the header of its row column
can be named with `groupsLabel`.
