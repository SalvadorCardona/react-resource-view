import { type ReactNode, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { BackendLogo } from "@/components/BackendLogo"
import { CopyCommand } from "@/components/CopyCommand"
import { BACKENDS, starterCommand, starterSection } from "@/lib/backends"
import { cn } from "@/lib/cn"

/**
 * Pick your backend, copy the command that starts a back office on it.
 *
 * The starter page has the same command for every backend, each under its own
 * heading; here the reader only sees theirs, and what to type after it.
 */
export function StarterPicker() {
  const [picked, setPicked] = useState(BACKENDS[0])

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div
        role="radiogroup"
        aria-label="Your backend"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
      >
        {BACKENDS.map((backend) => {
          const checked = backend.id === picked.id

          return (
            <button
              key={backend.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setPicked(backend)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition",
                checked
                  ? "border-view bg-view-soft text-foreground"
                  : "border-border text-muted-foreground hover:border-view/50 hover:text-foreground"
              )}
            >
              <BackendLogo backend={backend} className="h-7" />
              <span className="text-center">{backend.name}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <CopyCommand command={starterCommand(picked)} />
      </div>

      <ol className="mt-6 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
        <Step index={1} title="Install">
          <code className="font-mono text-xs text-foreground">
            cd my-admin && npm install
          </code>
        </Step>
        <Step index={2} title="Run">
          <code className="font-mono text-xs text-foreground">npm run dev</code>
        </Step>
        <Step index={3} title="Open">
          <code className="font-mono text-xs text-foreground">
            http://localhost:5173
          </code>{" "}
          — the example resource, listed from your API.
        </Step>
      </ol>

      <p className="mt-6 border-t border-border pt-5 text-sm">
        <Link
          to="/docs/resource-view/starter"
          hash={starterSection(picked)}
          className="inline-flex items-center gap-1.5 font-medium text-foreground transition hover:text-view"
        >
          {picked.generic ? "Another REST API" : picked.name}: the setup it writes
          and what the API has to allow
          <ArrowRight className="size-4" />
        </Link>
      </p>
    </div>
  )
}

function Step({
  index,
  title,
  children,
}: {
  index: number
  title: string
  children: ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-view text-xs font-semibold text-background">
        {index}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1">{children}</p>
      </div>
    </li>
  )
}
