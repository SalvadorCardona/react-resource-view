---
"react-resource-view": minor
---

Give a scope a ready-made admin shell instead of writing one from scratch.

Every project reached for the same `decoratorComponent`: a collapsible sidebar
built from the scope's `menu`, a top bar, a page header with sub-navigation
tabs, and a bottom bar on narrow screens instead of the sidebar. `AdminLayout`
is that shell, exported so a scope only needs to point at it:

```ts
const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: AdminLayout,
  menu: [createItemMenuWithResource({ resource: articlesResource })],
}
```

`createAdminLayout({ logo, topBarEnd })` builds a configured variant when the
host wants a logo or actions in the top bar — `decoratorComponent` only ever
receives `children`, so `AdminLayout` itself takes no props there.
