---
"react-resource-view": minor
---

Recognize a 401 or a 403 thrown by a scope's `authorization` from its `status`,
not only from `UnauthorizedError` and `ForbiddenError`. Any error carrying
`status: 401` calls `onUnauthorized`, any error carrying `status: 403` renders
the `forbiddenFallback`: an auth library no longer has to import the classes,
and two copies of `react-resource-view` in one bundle still agree. No other
status is recognized, and errors recognized today behave as before.
