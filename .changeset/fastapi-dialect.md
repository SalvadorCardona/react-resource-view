---
"react-resource-view": minor
---

Add a FastAPI dialect: `fastapiDialect()` lists, reads, creates, updates and
deletes against a standard FastAPI CRUD router, instead of showing empty lists
under the JSON-LD default.

A page is `skip` / `limit`, as in the FastAPI tutorial, or `page` / `size` with
`pagination: "page-size"` for fastapi-pagination, whose `{ items, total }`
drives the page count; a bare array hides the pagination. A sort is
`order_by=-created_at,title`, an array filter repeats its parameter, and a 422
lands under the field its `loc` names — `["body", "address", "city"]` on
`address.city`. Options: `primaryKey`, `pagination`, `defaultItemsPerPage`,
`orderParam` and `trailingSlash`.
