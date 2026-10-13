---
"react-resource-view": patch
---

A record saved from a button opening over a list (`openIn: "popup"` or
`"drawer"`) reads the list again with the filter it has now, instead of the one
the button mounted with — a list filtered on « A », then on « B », no longer
shows the rows of « A » under « B » after a save. The buttons of every row also
share a single request instead of each reading the list again.
