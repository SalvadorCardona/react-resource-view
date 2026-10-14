---
"react-resource-view": minor
---

Moving to another view shows that the click was heard, instead of nothing until
the next view appears at once: a thin bar runs along the top of the screen, in
the theme's primary colour, until the new view has its data, and the view fades
in, sliding up a few pixels. No new dependency.

- The bar waits 150 ms, so an instant navigation flashes nothing, then stays
  300 ms at least; it runs quickly, then slower, and fills up when the view is
  there. The loading view is marked `aria-busy`, the bar has
  `role="progressbar"`, and neither takes the focus.
- Under `prefers-reduced-motion: reduce`, the view fades without moving.
- `ResourceViewProvider` takes `navigationLoader` — a node, a component
  receiving `{ isNavigating }`, or `false` for nothing — and `viewTransition`
  (`true` by default).
- Any router works: a navigation counts from a click on a link of the library,
  or a call to its `navigate`, until the new view has loaded. The navigation
  port takes an optional `useIsNavigating`, which the TanStack adapter reads
  from `useRouterState`.
- `useIsNavigating()`, `useDelayedVisibility()` and `NavigationProgressBar` are
  exported, for an indicator drawn elsewhere.
