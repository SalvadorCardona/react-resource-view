---
"react-resource-view": minor
---

Open an action in a drawer.

`behavior: { openIn: "drawer" }` joins `"popup"` and `"window"`: the view slides
in as a panel rather than replacing the page or sitting in the middle of it.
From the right on a desktop, up from the bottom below the `md` breakpoint —
where a thumb reaches — and swiped away towards the side it came from.

The panel is as tall as the screen, which is what a long form wants: a record
with a dozen fields is filled in without the list behind it going anywhere. Like
a dialog, it closes itself on the resource's `onChange` rather than navigating
after a creation.
