import type { ReactNode } from "react"

/** The pages of the site, in reading order. */
export const pages = [
  { file: "index.html", title: "Overview" },
  { file: "routing.html", title: "Routing" },
  { file: "layouts.html", title: "Layouts" },
  { file: "demo.html", title: "Live demo" },
]

/**
 * Resolves a page link against the deployment base.
 *
 * GitHub Pages serves the site from /<repository>/, not from the domain root,
 * so a link written as "/routing.html" would leave the site.
 */
export const pageHref = (file: string): string => {
  const base = import.meta.env.BASE_URL
  return base.endsWith("/") ? base + file : `${base}/${file}`
}

const isCurrent = (file: string): boolean =>
  window.location.pathname.endsWith(file) ||
  (file === "index.html" && window.location.pathname.endsWith("/"))

export function Layout({
  title,
  intro,
  children,
}: {
  title: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-6xl gap-8 px-4 lg:px-8">
      <nav className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-52 lg:shrink-0 lg:py-16">
        <a
          href={pageHref("index.html")}
          className="font-semibold tracking-tight"
        >
          react-resource-view
        </a>
        <ul className="mt-6 space-y-1 text-sm">
          {pages.map((page) => (
            <li key={page.file}>
              <a
                href={pageHref(page.file)}
                className={`block rounded-md px-2 py-1 transition-colors ${
                  isCurrent(page.file)
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {page.title}
              </a>
            </li>
          ))}
        </ul>
        <a
          className="mt-6 block px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          href="https://github.com/SalvadorCardona/react-resource-view"
        >
          GitHub
        </a>
      </nav>

      <main className="min-w-0 flex-1 py-10 lg:py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          {intro && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{intro}</p>
          )}
        </header>

        <nav className="mb-10 flex flex-wrap gap-2 text-sm lg:hidden">
          {pages.map((page) => (
            <a
              key={page.file}
              href={pageHref(page.file)}
              className="rounded-md border border-border px-3 py-1.5"
            >
              {page.title}
            </a>
          ))}
        </nav>

        <div className="prose-docs max-w-2xl">{children}</div>

        <footer className="mt-16 max-w-2xl border-t border-border pt-6 text-sm text-muted-foreground">
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href="https://github.com/SalvadorCardona/react-resource-view"
          >
            Source on GitHub
          </a>
          <span className="px-2">·</span>
          MIT
        </footer>
      </main>
    </div>
  )
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="not-prose my-4 overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}
