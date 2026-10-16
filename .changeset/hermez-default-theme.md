---
"react-resource-view": minor
---

refactor: the optional `react-resource-view/styles.css` theme now follows the Hermez design system, not shadcn's neutral greys

Visible only to applications that import the library's stylesheet; an application with its own shadcn variables sees nothing change.

- Colours: warm "stone" greys (background `#fafaf9`, cards `#ffffff`, text `#1c1917`, secondary text `#57534e`, borders `#e7e5e4`, fields `#d6d3d1`), an orange primary `#bf4a02` under white text, the brand orange `#e46212` as focus ring, and `#fff6ee` as highlight. The `.dark` block keeps the same hue (background `#0c0a09`, primary `#ff8b44`). The destructive red is `#b91c1c`, so the destructive button reaches 4.5:1.
- New tokens: `--success`, `--info`, `--glory` and `--warning` (the `success`, `info`, `glory` and `warning` buttons and badges had no colour until now), `--chart-1` to `--chart-5`, and the typography variables `--typeface-heading`, `--typeface-body`, `--typeface-mono`, `--heading-weight`, `--heading-tracking` (with `font-heading`, `font-sans` and `font-mono` mapped to them).
- Radius: `--radius` goes from `0.875rem` to `0.75rem`, and `--radius-2xl` to `--radius-4xl` now derive from it — buttons, selects and badges stay pills, slightly tighter, and follow a custom `--radius`.
- Shadows: `shadow-sm`, `shadow-md` and `shadow-lg` are tinted with the theme's text colour, lighter than Tailwind's.
- No font is shipped and no rule restyles the application's headings: `--typeface-heading` names Bricolage Grotesque, used only if the application loads it. The variables stay in `@layer base`, so the application's own still win.
