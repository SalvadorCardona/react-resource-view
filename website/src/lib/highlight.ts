import { createHighlighterCoreSync } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import bash from "shiki/langs/bash.mjs"
import css from "shiki/langs/css.mjs"
import json from "shiki/langs/json.mjs"
import tsx from "shiki/langs/tsx.mjs"
import typescript from "shiki/langs/typescript.mjs"
import vitesseDark from "shiki/themes/vitesse-dark.mjs"
import vitesseLight from "shiki/themes/vitesse-light.mjs"

export type CodeLanguage = "tsx" | "ts" | "css" | "bash" | "json"

/**
 * One highlighter for the whole site, built synchronously.
 *
 * Shiki's JavaScript engine needs no WebAssembly, which is what makes a
 * synchronous highlighter possible — and a synchronous one is what lets a code
 * block be a plain component rather than a suspending one. The server renders
 * the markup, the client hydrates the identical string.
 *
 * Only the five languages the documentation actually uses are loaded; the full
 * bundle would carry two hundred grammars for nothing.
 */
const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  themes: [vitesseLight, vitesseDark],
  langs: [tsx, typescript, css, bash, json],
})

const LANG_ALIAS: Record<CodeLanguage, string> = {
  tsx: "tsx",
  ts: "typescript",
  css: "css",
  bash: "bash",
  json: "json",
}

/**
 * Highlights a snippet against both themes at once.
 *
 * `defaultColor: false` makes Shiki emit `--shiki-light` and `--shiki-dark`
 * custom properties instead of committing to one palette, so switching the site
 * theme is a CSS concern and never re-runs the tokenizer.
 */
export function highlight(code: string, lang: CodeLanguage = "tsx"): string {
  return highlighter.codeToHtml(code.trim(), {
    lang: LANG_ALIAS[lang],
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: false,
  })
}
