import type { ReactNode } from "react"
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { Footer } from "@/components/Footer"
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle"
import { configureLibraries } from "@/demo/setup"
import appCss from "@/styles/app.css?url"

// Both libraries are configured through module-level singletons, so this has to
// run before the first component of either is rendered — on the server as well
// as in the browser.
configureLibraries()

const TITLE = "Resource & Form — React forms and CRUD views for REST APIs"
const DESCRIPTION =
  "Documentation for react-data-form and react-resource-view: describe a form as data, declare a resource, and get the list, the detail and the CRUD forms wired to your API."

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#7c5cff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // BASE_URL already ends in a slash, and carries the /<repository>/ prefix
      // GitHub Pages serves a project site under.
      {
        rel: "icon",
        href: `${import.meta.env.BASE_URL}favicon.svg`,
        type: "image/svg+xml",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Blocking on purpose: the theme has to be settled before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        {children}
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
