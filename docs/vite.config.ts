import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const src = fileURLToPath(new URL("../src", import.meta.url))
const here = fileURLToPath(new URL(".", import.meta.url))

// The site consumes the library straight from source, so the page always shows
// what the working tree does — no build step in between.
export default defineConfig({
  root: here,
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react-resource-view\/tanstack$/, replacement: `${src}/tanstack/index.tsx` },
      { find: /^react-resource-view$/, replacement: `${src}/index.ts` },
      { find: "@", replacement: src },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
    // One real file per page: a static host answers each without a 404.
    rollupOptions: {
      input: {
        index: resolve(here, "index.html"),
        routing: resolve(here, "routing.html"),
        layouts: resolve(here, "layouts.html"),
        demo: resolve(here, "demo.html"),
      },
    },
  },
})
