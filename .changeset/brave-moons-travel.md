---
"react-resource-view": minor
---

Speak Strapi and Supabase, not only JSON-LD.

The views assumed one API family everywhere: a collection was `member` and
`totalItems`, an item carried its own IRI in `@id`, a page was `page` and
`itemsPerPage`, a validation failure was a list of `violations`. Every one of
those is now a decision an **API dialect** makes, and three ship with the
package:

```ts
import { configureApi, strapiDialect } from "react-resource-view"

configureApi({
  baseUrl: "https://cms.example.com",
  getAuthToken: () => getUserToken(),
  dialect: strapiDialect(),
})
```

- `jsonLdDialect()` — API Platform and Hydra. The default, and it still goes
  through the client of `jsonld-api-client`, so an application already talking
  to API Platform needs no change at all.
- `strapiDialect()` — Strapi v4 and v5. `pagination[page]`, `filters[field][$eq]`,
  `sort[0]`, `populate`, writes wrapped in `data`, and the v4 `{ id, attributes }`
  envelope flattened so both versions read alike.
- `supabaseDialect({ apiKey })` — Supabase, over PostgREST. `limit`/`offset`,
  `field=eq.value`, `order`, the count read from `Content-Range`, rows addressed
  by their primary key, and writes that ask for the stored row back.

A resource may also declare a `dialect` of its own, for an application reading
two backends at once. Filters, pagination and sorting are written once, in the
package's own vocabulary, and the dialect translates them.

JSON-LD is now an option rather than an assumption: a relation is only
dereferenced as an IRI where the dialect says relations are IRIs, no Mercure
subscription is opened against a backend that runs no hub, and the CSV export
button hides itself where the API serves no CSV.
