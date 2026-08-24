---
"react-resource-view": minor
---

Initial release: CRUD views for JSON-LD / Hydra APIs — list, read, create,
update and delete — in table, card, column, split, calendar or timeline
layouts, wired to the API and to the URL.

The package knows no router: it asks for four navigation primitives through
`configurePorts`, and ships an adapter for TanStack Router on the `/tanstack`
subpath. Applications on another router install nothing extra.
