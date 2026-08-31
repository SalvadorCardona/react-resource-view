---
"react-resource-view": minor
---

A row now offers update and delete. Read is gone from the default, and which
actions a row draws is a view's decision — `view.behavior.rowActions`.

**This changes what an existing list renders.** A row is already the record —
the table edits it in place, the other layouts draw it in full — so a button
whose only job is to show the same fields again was not earning the width it
took. Put it back where the detail view carries more than the list does:

```ts
tableViewOptionFactory({
  behavior: {
    rowActions: [ActionList.read, ActionList.update, ActionList.delete],
  },
})
```

Permissions still apply on top: an action listed there without the matching
`can*` renders nothing.

`ListResourceViewButton` had two implementations — one exported from the entry
point, one declared inside `ResourceViewButton.tsx` and used by the table. The
duplicate is gone; both now resolve to the same component.

The dialog's close button carried a hard-coded French label, which no
dictionary could reach. It goes through `Trans` like every other string.
