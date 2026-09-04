import js from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import reactHooks from "eslint-plugin-react-hooks"
import prettier from "eslint-config-prettier"

export default [
  {
    // `website/` is a standalone project with its own toolchain and its own
    // dependencies, none of which are installed by this package. `.claude/`
    // holds agent skills restored from `skills-lock.json` — third-party code
    // this package neither writes nor ships.
    ignores: [
      "dist/**",
      "docs/dist/**",
      "website/**",
      ".claude/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  {
    // The command line is plain Node ESM, shipped as it is written: no
    // transform, no bundler, and therefore no browser globals either.
    files: ["cli/**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: { process: "readonly", console: "readonly", URL: "readonly" },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        DOMParser: "readonly",
        FileReader: "readonly",
        File: "readonly",
        Blob: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLImageElement: "readonly",
        Image: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint, "react-hooks": reactHooks },
    rules: {
      ...tseslint.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Le code s'appuie volontairement sur `any` pour les données de formulaire,
      // dont la forme n'est connue qu'à l'exécution.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "off",
    },
  },
  prettier,
]
