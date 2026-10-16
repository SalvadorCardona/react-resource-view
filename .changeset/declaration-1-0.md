---
"react-resource-view": major
---

1.0: a declaration that reads once and makes sense without the documentation.
Breaking changes, each one rewritten by `npx react-resource-view migrate` or
explained step by step in `MIGRATION-1.0.md`; `migrations/1.0.json` is the same
list as data, for a script or an AI to apply.

- **One place per notion.** `view` is gone: what every action shares — `form`,
  `fullWidth`, `titleField`, `components`, `description` — sits at the root of
  the resource; what belongs to one action sits in `views.list | read | create |
update | delete`, each typed with only the options that have an effect there.
  Root, action and layout are merged deeply, so `views.update` says only what
  differs, and `inputs: { notes: false }` removes an inherited field. Actions
  are plain strings (`views.update`, `rowActions: ["read"]`); `ActionList` is
  still accepted.
- **Permissions.** `canRead`, `canList`, `canCreate`, `canUpdate`, `canDelete`
  and `behavior.canExport` become one `permissions` object — `"all"`,
  `"readonly"`, a list of actions, or a boolean or a function per action.
  Everything is allowed by default, so the shortest declaration has all its
  buttons. A function is told the record (`({ item }) => item.status !== "done"`)
  and may answer asynchronously; answers are cached per record while a list is
  on screen. A refused action also protects its route: `/books/update/1` draws
  the scope's `forbiddenFallback` instead of the form. `canList` is now read for
  the list (it was ignored). `usePermission(action, item)` and
  `useAllowedActions(actions, item)` are added; `permissionResource` takes
  `{ item, context }` and may return a promise.
- **`behavior` is gone**, each option moved to where it has an effect:
  `openIn` → `views.<action>.open` (`"page"`, `"dialog"`, `"drawer"`);
  `closeAfterUpdate`, `refreshDataAfterUpdate`, `redirectToAfterUpdate` → one
  `afterSave: "close" | "stay" | "reload" | { redirect: (item) => string }`;
  `rowActions` → `views.list.rowActions`; `eventSourced` → `realtime` at the
  root; `openRecordIn` → `views.read.open`; `selectable`, `bulkActions` →
  options of `layout.board()`.
- **Layouts.** `viewVariants` becomes `views.list.layouts`, and the seven
  factories one `layout` namespace: `layout.table()`, `layout.cards({ columns })`,
  `layout.board({ groupBy, columns, selectable })`, `layout.calendar({ dateField })`,
  `layout.timeline({ startField, endField, groupBy })`, `layout.split({ readInList })`,
  `layout.items()` and `layout.custom()` for one's own (read its options with
  `useLayout()`). Field options are checked against the resource's item type —
  a typo is a TypeScript error — and share one suffix: `titleField`,
  `dateField`, `colorField`, `statusField`. A layout's URL id is its type, so a
  new label breaks no shared link; `fields` picks a layout's columns.
- **Data.** Without `path`, `storage: "local"` must be declared: a forgotten
  path no longer turns into localStorage silently. `preGetCollection`,
  `preGetItem`, `preCreate`, `preUpdate` become `hooks.beforeList`,
  `beforeRead`, `beforeCreate`, `beforeUpdate`, joined by `beforeDelete`,
  `afterSave` and `afterDelete`; hooks may be asynchronous and always receive
  the view context — creations and updates used to lose it on the way to the
  repository. Hand-written repository methods move to `repository: { … }`.
  `limit` becomes `quota: { get, fallback }` (`useLimit` → `useQuota`).
- **Titles and components.** `name` is declared once; titles are derived and
  overridden with `views.<action>.title`, a button's text with `buttonLabel`.
  `viewComponent` and the other `xxxComponent` keys, and `decoratorComponent`,
  become one `components` object (`view`, `wrapper`, `top`, `bottom`, `empty`
  — ex `noResult` —, `pagination`, `navigation`, `title`, `actions`).
- **Tabs.** `subViewResource` becomes `views.read | update.tabs: { orientation,
aside, items }`, a tab being `{ id, label, resource, filter: ({ item }) => … }`
  instead of an `onInitViewResource` returning the whole context.
- **Scopes and defaults.** A resource no longer names its `scope`: the scope's
  `resources` ties them, and `menu: "auto"` (or a list mixing resources, links
  and groups) builds the navigation. `setResourceConfig({ defaultResource })`
  becomes `configureResourceView({ defaults })`, merged deeply into every
  resource, including those declared before it is called.
- **Types.** `ResourceDefinition` is what one writes, `ViewResource` what the
  library builds; `ViewResourceInterface`, `ResourceOptionInterface`,
  `ViewInterface` and the factory option interfaces are replaced.
- **Optimistic writes.** Every write going through a resource's repository —
  a form saved, a row deleted, a cell edited in place, a card moved, the
  writes of a bulk action made through its new `mutation` argument — is drawn
  before the API answers: the row changes at once (a created one appears,
  marked as being saved), the API's answer replaces it as soon as it comes,
  and a refusal puts it back with a toast — a form keeps the API's violations
  on its fields. Several writes to one record show the last one; a list read
  again while a write is in flight (a realtime push) keeps the row as
  written. On by default — a change of perceived behaviour —, turned off with
  `optimistic: false` at the root or per action
  (`views.delete: { optimistic: false }`). `useResourceMutation(resource)`
  gives an application's own actions the same optimism and rollback
  (`create`, `update`, `remove`, `mutate`, `isPending`), and `RowInterface`
  gains `pending`. Built on the library's own state rather than React 19's
  `useOptimistic`: no new requirement on the React version.
- **One routed opening.** `views.<action>.open` is resolved once, and anything
  but `"page"` is written into the URL under the view it was opened from
  (`…/tasks/list/tasks/update/12`, filter and layout kept): a row's button —
  now a real link —, a board's card and a link typed by hand open the same
  frame, Back closes it, a reload opens it again over the same list, and a
  save closes it by going back to that URL. A list reads itself again once per
  save, instead of once per button of its rows. `layout.board({ openRecord,
expandable })` is gone: a card opens the record's `read` view where
  `views.read.open` says — on its page by default, where it used to open
  nothing.
- **Frames of one's own.** `open.custom({ type, placement, component })`, on
  the model of `layout.custom()`: the component receives the title, the view,
  `close` and the link to the full page. `placement: "inline"` draws the view
  under the row that opened it in a table, a plain list or a card grid — a
  `layout.custom()` says it can with `supports: ["inline"]` and draws
  `<InlineChildView row={row} />` — and falls back to a dialog elsewhere, with
  a warning in development. `configureResourceView({ open: { accordion } })`
  registers a frame under a name, typed through the `OpenFrames` interface.
- **"Open in full page".** A `read` or `update` view opened in a frame has a
  link to the same view on its page beside the close button, a real
  `<a href>` that Ctrl/Cmd+click opens in a new tab. `expandable: false` on
  the view takes it away; `create` and `delete` do not have it unless they say
  `expandable: true`.
- **Checked in development.** `createViewResource` and `layout.*` throw on a key
  they do not read — with the closest key, or the exact 1.0 rewrite of a 0.x
  one — on a resource with no data source, a board without `groupBy`, two
  layouts sharing a URL id, and warn about a title identical to the derived
  one. Nothing is checked in production.
- **Command line.** `npx react-resource-view migrate [paths]` rewrites 0.x
  declarations (`--dry-run`, `--check`); `create-view-variant` writes a
  `layout.custom()` file; `init` starts on the 1.0 syntax.
