import { fileURLToPath } from "node:url"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/**
 * The documentation site is a TanStack Start application: the prose is rendered
 * on the server, the demos are mounted in the browser.
 *
 * Start was picked over a generic SSR framework because `react-resource-view`
 * keeps its whole view context in the URL and ships a TanStack Router adapter.
 * Running the site on that router means the demos exercise the same navigation
 * port the documentation recommends, rather than a bespoke one written for the
 * site.
 */
export default defineConfig({
  plugins: [tanstackStart(), viteReact(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  ssr: {
    // Both libraries ship ESM that imports CSS and reaches for browser globals.
    // Bundling them for the server lets Vite apply the same transforms it
    // applies to the site's own code, instead of handing raw ESM to Node.
    noExternal: [
      "react-data-form",
      "react-resource-view",
      "@base-ui/react",
      "framer-motion",
      "cmdk",
      "sonner",
      "react-day-picker",
      "react-easy-crop",
    ],
  },
})
