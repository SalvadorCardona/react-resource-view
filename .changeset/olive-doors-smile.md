---
"react-resource-view": minor
---

Open a small window on a calendar event or a timeline bar.

Clicking one used to print every key of the record — `@context`, `@id` and the
dates already written on the event included — which is a data dump rather than a
preview. What opens now names the event, dates it in one line, summarises it in
at most five fields labelled the way the resource's `form.inputs` labels them,
and hands over to the row's actions for the rest.

The summary is the variant's `rowComponent`, which both layouts now default to
`PreviewRowComponent` instead of `DumpRowComponent`: a resource with something
better to show still declares its own, exactly as in the card and list layouts.
