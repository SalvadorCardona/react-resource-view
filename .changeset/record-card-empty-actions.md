---
"react-resource-view": patch
---

Leave out the foot of a record card — its separator and the padding under it — when the resource permits none of the row's actions, instead of ending the card on a stray line above an empty strip.

The card layout now reads which actions a row offers (`behavior.rowActions`,
then `canUpdate`, `canDelete`…) before drawing their bar, as the calendar and
timeline preview already did. A card with at least one permitted action is
unchanged.
