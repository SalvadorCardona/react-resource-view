---
"react-resource-view": minor
---

Name the record on screen in `AdminLayout`, instead of an empty top bar above a bare "Edit a user".

The top bar now carries a breadcrumb — the scope's `label`, the resource, the
record — where it used to hold nothing but the sidebar toggle. On a record, the
page header links back to the list, takes the record's name as its title (read
from `title`, `name` or `label`, or from the view's new `titleKey`), says the
action and the id underneath, and offers the actions still worth having there:
edit from the read page, delete from either — deleting goes back to the list.

A view overrides the title with `components.title` and the actions with
`components.actions`; `components.navigation` still replaces the whole header.
