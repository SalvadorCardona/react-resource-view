---
"react-resource-view": minor
---

Read the sub-views of a record without three rows of buttons in the way.

The tab bar wrapped onto as many lines as the tabs needed, and cut every label
to twelve characters below `md` to limit the damage — a record with eight
sub-views pushed its content off a phone screen before a word of it was read.
The bar now stays on one line and scrolls sideways, labels whole.

`subViewResource.orientation: "vertical"` is the other shape: the tabs go down
a column beside the sub-view, which is what a record with a dozen of them
wants — the whole menu is read at once, and it follows the reader down the
page. Below `md` the column would leave the sub-view a third of the screen, so
it falls back to the scrolling bar there; the same declaration reads both ways.
