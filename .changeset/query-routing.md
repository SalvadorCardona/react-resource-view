---
"react-resource-view": minor
---

The view context can now live entirely in the query string.

`configurePorts({ routing: { mode: "query", basePath: "/docs.html" } })` writes
links as `/docs.html?view=admin/articles/update/42` instead of
`/admin/articles/update/42`. It exists for static hosting, where a deep path has
no server to answer it and returns 404, and for embedding the views in a page
whose path is not yours to control.

`parseLink` reads a URL carrying the routing parameter as query mode whatever
the configuration says, so a link shared from a statically hosted page keeps
working wherever it is opened.
