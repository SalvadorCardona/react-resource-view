---
"react-resource-view": minor
---

Pin a block at the bottom of `AdminLayout`'s sidebar — "Need help?", support, documentation — instead of leaving its footer empty with no way to fill it.

`AdminLayout` and `createAdminLayout` now take `footerMenu`, menu entries drawn
like the scope's `menu` under an optional `footerMenuTitle`, and
`sidebarFooter`, any node rendered below them. An entry whose `href` is
absolute leaves the application: a web page opens in a new tab, a `mailto:`
hands over to the mail client. On narrow screens both go behind a last entry of
the bottom bar, named after `footerMenuTitle` ("More" without one), which opens
them in a drawer. Without either option the sidebar renders no footer, as
before.
