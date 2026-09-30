import { fileURLToPath } from "node:url"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * The site's own tests, apart from `vite.config.ts`: the TanStack Start plugin
 * there prerenders routes and has nothing to do with mounting a component in
 * jsdom.
 */
export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Both libraries ship ESM that imports CSS; inlining them lets Vite handle
    // it, as `ssr.noExternal` does for the build.
    server: { deps: { inline: ["react-data-form", "react-resource-view"] } },
    css: false,
  },
})
