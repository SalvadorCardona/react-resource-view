---
"react-resource-view": minor
---

Add a Django REST Framework dialect: `djangoDialect()` reads DRF's
`{ count, next, previous, results }` page (or a bare array when the view has no
paginator), pages with `page` / `page_size` — or `limit` / `offset` with
`pagination: "limit-offset"` — sorts with `ordering=-field`, sends filters as
query parameters for django-filter, addresses a record at `/articles/{id}/` with
DRF's trailing slash, and pins a 400's `{ field: ["message"] }` on its input.
Options: `primaryKey`, `pagination`, `pageSizeParam`, `defaultItemsPerPage`,
`orderParam` and `trailingSlash`.

`npx react-resource-view init -b django` starts a back office on it, dumping the
schema drf-spectacular serves at `/api/schema/?format=json`.
