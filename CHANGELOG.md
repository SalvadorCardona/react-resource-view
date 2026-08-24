# react-resource-view

## 0.4.0

### Minor Changes

- Add `ownsDocumentHead`, to stop competing with a host router over the head.

  `MetaResource` always wrote the page's title, canonical and social tags. That
  is right for a single-page application, where nothing else does — but a
  server-rendered host declares metadata per route, and both writing it leaves
  the page with two of every tag. A crawler reads whichever came first, which is
  the host's, so the views' work was both invisible and harmful.

  Set `ownsDocumentHead: false` when the host router owns the head. The title is
  still kept in step as the visitor moves between views. It defaults to true, so
  existing applications are unaffected.

## 0.3.1

### Patch Changes

- Build page metadata without reading `window`.

  `MetaResourceComponent` took the canonical URL from `window.location`. There is
  no `window` on a server, so it threw while rendering the one element a crawler
  always reads — and React answered by abandoning the server render entirely,
  returning an empty document.

  It now reads the path from the navigation port, which a router answers on both
  sides.

## 0.3.0

### Minor Changes

- 730b568: Initial release: CRUD views for JSON-LD / Hydra APIs — list, read, create,
  update and delete — in table, card, column, split, calendar or timeline
  layouts, wired to the API and to the URL.

  The package knows no router: it asks for four navigation primitives through
  `configurePorts`, and ships an adapter for TanStack Router on the `/tanstack`
  subpath. Applications on another router install nothing extra.

- 6101570: The view context can now live entirely in the query string.

  `configurePorts({ routing: { mode: "query", basePath: "/docs.html" } })` writes
  links as `/docs.html?view=admin/articles/update/42` instead of
  `/admin/articles/update/42`. It exists for static hosting, where a deep path has
  no server to answer it and returns 404, and for embedding the views in a page
  whose path is not yours to control.

  `parseLink` reads a URL carrying the routing parameter as query mode whatever
  the configuration says, so a link shared from a statically hosted page keeps
  working wherever it is opened.

- Add `useIsActiveItemMenu`, which works while rendering on a server.

  `isActiveItemMenu` reads `window.location`. There is no `window` on a server,
  so it threw mid-render; React caught it, silently fell back to rendering in the
  browser, and left an empty document behind — a page that looks fine to a
  visitor and empty to anything that only reads the markup.

  The new hook asks the navigation port instead, which a router can answer on
  either side, and returns a predicate so a menu can test every entry.
  `isActiveItemMenu` no longer throws off the browser, but reports every entry as
  inactive there; prefer the hook wherever the markup is rendered on a server.

### Patch Changes

- f946e39: `isActiveItemMenu` now works in query mode.

  It compared `window.location.pathname` against the entry's href. In query mode
  the context lives in the query string, so the pathname is the same for every
  page and no entry was ever marked active.

- 36efeea: Fix `filter` and `defaultData` losing everything after a reserved character.

  They were serialised with `encodeURI`, which leaves `&`, `=` and `#` untouched.
  A value such as `{ title: "Tom & Jerry" }` produced
  `?defaultData={"title":"Tom & Jerry"}`, where the ampersand ended the parameter
  and the rest was read as a stray one. `encodeURIComponent` escapes them.

  Links written with the previous encoding still parse, so bookmarks and shared
  URLs keep working.
