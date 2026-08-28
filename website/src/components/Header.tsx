import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Github, Menu, X } from "lucide-react"
import { Logo } from "@/components/Logo"
import { Search } from "@/components/Search"
import { Sidebar } from "@/components/Sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SECTIONS } from "@/lib/navigation"
import { cn } from "@/lib/cn"

export function Header({ showMenu = false }: { showMenu?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-3 px-4 lg:px-6">
          {showMenu && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open the navigation"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              Resource&nbsp;&amp;&nbsp;Form
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                to={`/docs/${section.id}`}
                className="group rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      section.accent === "form" ? "bg-form" : "bg-view"
                    )}
                  />
                  {section.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Search />
            <ThemeToggle />
            <a
              href="https://github.com/SalvadorCardona"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="h-full w-[19rem] max-w-[85vw] overflow-y-auto border-r border-border bg-background p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the navigation"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
