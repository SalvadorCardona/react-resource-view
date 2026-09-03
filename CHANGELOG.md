# react-resource-view

## 0.6.0

### Minor Changes

- 2ea49a4: Speak Strapi and Supabase, not only JSON-LD.

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

- a6582d3: A row now offers update and delete. Read is gone from the default, and which
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

### Patch Changes

- dbdb70e: Stop overwriting `document.title` when `ownsDocumentHead` is `false`.

  The port says the host application declares its own head, but the title was
  still written imperatively from an effect. Any page embedding a view — a
  documentation page, a dashboard panel — ended up carrying the name of the
  embedded view instead of its own.

- a6582d3: Keep the chosen layout when a list navigates to itself.

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

- 8520b8c: Make a form opening in a dialog behave like one.

  `behavior: { openIn: "popup" }` drew a dialog with no name, introduced by
  whatever sentence the _list_ had been given — every action inherits the
  resource's `view`, description included — and a creation made from it
  navigated straight out of the page the dialog sat on, taking the list, its
  filters and its page with it.

  - A popup is now titled by the view it opens, which assistive technology
    announces and a reader can read; the list's description stays on the list.
  - After a creation in a popup nothing navigates: the dialog closes on the
    resource's `onChange` and the list refreshes underneath. On a screen of its
    own the move to the new record's edit view is unchanged — and now builds its
    link in the resource's own scope, instead of walking out of the area it was
    made in.
  - A view an action does not name is called after that action: a resource whose
    list is "Coffee beans" edits "Edit — Coffee beans" rather than a second
    "Coffee beans". A name the action declares is left alone.
  - The delete confirmation speaks English — "Supprimer ?", "Annuler" and the
    error toast were shipped in French and never went through `react-mini-i18n` —
    and no longer repeats the name of the view that frames it.
  - Cards of one row line their actions up on the bottom edge, instead of leaving
    each set of buttons wherever its record happened to end.

## 0.5.0

### Minor Changes

- 29b4a50: Stop shipping French. The calendar and the timeline formatted their dates with
  a hardcoded `fr` date-fns locale, started their weeks on Monday and sorted their
  rows with a French collation, and three labels were written in French. Dates now
  follow the `dateLocale` port — English (US) by default — which also decides the
  first day of the week and the collation:

  ```ts
  import { fr } from "date-fns/locale"
  configurePorts({ dateLocale: fr })
  ```

  `getDateLocale()` and `getWeekStartsOn()` read it back.

  **Breaking for applications relying on the former defaults:** "Aujourd'hui"
  became "Today", "Nettoyer la recherche" became "Clear the search", and dates are
  formatted in English until `dateLocale` is set. Translate the new labels through
  `react-mini-i18n`, as with every other label of the package.

## 0.4.1

### Patch Changes

- a684375: Keep what the user picks while the list is fetching. A request landing used to
  write the whole view context back — the one captured when it left — so a layout
  chosen from the variant tabs, or a filter applied, was reverted a few
  milliseconds later. Requests now bring back rows only, `setViewResource` accepts
  an updater like React's own setters, and the variant tabs are controlled, so the
  highlighted tab is always the layout on screen.

  The timeline's footer counts are translatable, and the header of its row column
  can be named with `groupsLabel`.

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
