---
"react-resource-view": minor
---

Add a command that scaffolds a view variant.

`npx react-resource-view create-view-variant Heatmap --dir src/views` writes one
file — the list, row and item components, the factory that declares them and the
options interface to extend — where the project keeps its views. Run bare, it
asks for the name and the directory; `--icon`, `--jsx`, `--force`, `--dry-run`
and `--yes` cover the rest.

Nothing about declaring a variant changes: the generated factory goes into
`viewVariants` beside the built-in ones.
