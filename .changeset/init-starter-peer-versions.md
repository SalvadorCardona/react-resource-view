---
"react-resource-view": patch
---

`init` writes the `react-data-form`, `react-mini-i18n`, `resource-registry` and
`@tanstack/react-router` ranges from the package's own `peerDependencies`, so a
generated starter installs without `--legacy-peer-deps` instead of failing with
`ERESOLVE` on a hard-coded `react-data-form@^0.2.1` against a `^0.1.0` peer.
