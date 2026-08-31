---
"react-resource-view": patch
---

Keep the chosen layout when a list navigates to itself.

Selecting a row in the split view switched the reader to the table. Two things
lost the variant on the way:

- `generateLink` never serialised it, so the URL the split view navigated to
  said nothing about which layout it came from. It now carries `?variant=<id>`,
  and `parseLink` reads it back.
- `useResolvedViewParams` rebuilds the context field by field, and
  `viewVariantId` was not among them — so a variant handed to
  `ResourceViewProvider`, or read off the URL, was dropped before it reached the
  view. Both now come through.

Every layout that renders a record in full — card, item list, columns, split —
draws it in a frame of its own and offers the row's actions, instead of handing
the bare `rowComponent` to the page.

The columns layout wrapped each row a second time before passing it on, so the
row component received an object whose every field was `undefined` and the board
drew blank cards. Columns also gained a count, an empty state, and a drop
target that highlights only the column under the pointer.

The timeline's `colorByStatus` was declared by the factory and read by nobody;
bars now take their colour from it. Its two footer counts were adjacent bare
text nodes — a single anonymous flex item — so they read as one glued sentence
rather than sitting at either end.
