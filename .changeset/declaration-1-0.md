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
  root; `openRecordIn`, `selectable`, `bulkActions` → options of
  `layout.board()`.
- **Layouts.** `viewVariants` becomes `views.list.layouts`, and the seven
  factories one `layout` namespace: `layout.table()`, `layout.cards({ columns })`,
  `layout.board({ groupBy, columns, openRecord })`, `layout.calendar({ dateField })`,
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
- **Checked in development.** `createViewResource` and `layout.*` throw on a key
  they do not read — with the closest key, or the exact 1.0 rewrite of a 0.x
  one — on a resource with no data source, a board without `groupBy`, two
  layouts sharing a URL id, and warn about a title identical to the derived
  one. Nothing is checked in production.
- **Command line.** `npx react-resource-view migrate [paths]` rewrites 0.x
  declarations (`--dry-run`, `--check`); `create-view-variant` writes a
  `layout.custom()` file; `init` starts on the 1.0 syntax.
