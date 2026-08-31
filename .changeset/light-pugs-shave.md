---
"react-resource-view": patch
---

Stop overwriting `document.title` when `ownsDocumentHead` is `false`.

The port says the host application declares its own head, but the title was
still written imperatively from an effect. Any page embedding a view — a
documentation page, a dashboard panel — ended up carrying the name of the
embedded view instead of its own.
