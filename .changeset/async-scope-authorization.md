---
"react-resource-view": minor
---

Let a scope's `authorization` wait for a real session — `authClient.getSession()`, a `/me` call — instead of having to answer synchronously, and keep the scope hidden until it has.

`authorization` may now return `boolean | Promise<boolean>`; a synchronous
function works as before. Nothing of the scope renders while it is pending:
`authorizationFallback` shows instead, the page loader by default. An
`UnauthorizedError`, thrown or rejected, still calls `onUnauthorized`. A
`ForbiddenError`, thrown or rejected, or a `false` result, now renders
`forbiddenFallback` — an "Access denied" message by default — where a
`ForbiddenError` used to reach the error boundary and a `false` was ignored.
Both fallbacks are accepted on the scope and on the provider configuration,
the scope's winning.

The check runs again when the scope changes, and on demand through
`recheckAuthorization()` from `useScopeContext()`, so a sign-out is taken into
account without a reload. An answer that arrives after the scope changed is
ignored.
