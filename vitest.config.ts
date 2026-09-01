import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The documentation pages import the package by name. Resolved from
    // source, as the site itself does, rather than from `dist`: the tests run
    // before the build, and a stale — or missing — build is not what they mean
    // to exercise.
    alias: [
      {
        find: /^react-resource-view\/tanstack$/,
        replacement: fileURLToPath(
          new URL("./src/tanstack/index.tsx", import.meta.url)
        ),
      },
      {
        find: /^react-resource-view$/,
        replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
    // `react-mini-i18n` is linked locally and ships its own copy of React;
    // without deduplication the hooks would run against two instances.
    dedupe: ["react", "react-dom"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // The documentation site lives in the repo and is tested with it.
    include: ["src/**/*.test.{ts,tsx}", "docs/**/*.test.{ts,tsx}"],
  },
})
