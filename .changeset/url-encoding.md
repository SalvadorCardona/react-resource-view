---
"react-resource-view": patch
---

Fix `filter` and `defaultData` losing everything after a reserved character.

They were serialised with `encodeURI`, which leaves `&`, `=` and `#` untouched.
A value such as `{ title: "Tom & Jerry" }` produced
`?defaultData={"title":"Tom & Jerry"}`, where the ampersand ended the parameter
and the rest was read as a stray one. `encodeURIComponent` escapes them.

Links written with the previous encoding still parse, so bookmarks and shared
URLs keep working.
