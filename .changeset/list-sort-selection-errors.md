---
"react-resource-view": minor
---

feat(views): a list sorts by its column headers, selects its records in every layout and says when it could not load, not only on the board and not with an empty list

- `views.list.sort: { fields, initial }`: the table's headers of the fields named sort ascending, then descending, then not at all (`aria-sort`); the sort goes to the API through the dialect, into the URL, and survives "Clear the search". `useSort()` gives the same to a layout of one's own.
- **Breaking (1.0):** `selectable` and `bulkActions` leave `layout.board()` for `views.list`, and reach every layout: checkboxes on the table's rows (and "Select all" in its header), the cards and the items. `bulkActions` accepts `"delete"`, which deletes the selection after a confirmation, as far as `permissions.delete` allows. `selectable` defaults to `true` on a board and wherever bulk actions are declared. `npx react-resource-view migrate` rewrites both (RV1-BEHAV-006, RV1-LAYOUT-014).
- A view whose records could not be loaded draws what the API answered and "Try again" (`components.error` replaces it), rather than "An error occurred" in a list, or an empty form that could be saved over the record. `loadError` on the view context holds what the request threw.
