import { Github } from "lucide-react"
import { Logo } from "@/components/Logo"
import { FORM_SECTION, VIEW_SECTION } from "@/lib/navigation"

/**
 * The footer of every page.
 *
 * Rendered once from the root document rather than per route, so a page added
 * tomorrow carries it without remembering to.
 */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="flex items-center gap-2">
          <Logo className="size-5" />
          <span>
            MIT · built by{" "}
            <a
              href="https://cardona.digital"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
            >
              Salvador Cardona
            </a>
          </span>
        </p>

        <nav className="flex flex-wrap items-center gap-4">
          <a
            href={FORM_SECTION.repository}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Github className="size-3.5" />
            react-data-form
          </a>
          <a
            href={VIEW_SECTION.repository}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Github className="size-3.5" />
            react-resource-view
          </a>
        </nav>
      </div>
    </footer>
  )
}
