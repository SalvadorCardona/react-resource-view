import { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"
import { cn } from "@/lib/cn"

const MANAGERS = {
  pnpm: "pnpm add",
  npm: "npm install",
  yarn: "yarn add",
  bun: "bun add",
} as const

type Manager = keyof typeof MANAGERS

/**
 * The install line, in the reader's package manager.
 *
 * A landing page that only ever shows `pnpm add` asks a third of its readers to
 * translate before they can start. Four words of state cost nothing and remove
 * that step — and the button copies the whole line, which is what anyone does
 * with it anyway.
 */
export function InstallCommand({
  packages,
  className,
}: {
  packages: string
  className?: string
}) {
  const [manager, setManager] = useState<Manager>("pnpm")
  const [copied, setCopied] = useState(false)
  const command = `${MANAGERS[manager]} ${packages}`

  function copy() {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div
      className={cn(
        "mx-auto w-fit max-w-full overflow-hidden rounded-xl border border-border bg-background/80 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-1 border-b border-border px-1.5 py-1">
        <Terminal className="mx-1.5 size-3.5 shrink-0 text-muted-foreground" />
        {(Object.keys(MANAGERS) as Manager[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setManager(name)}
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[11px] transition",
              manager === name
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-3 py-2.5">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-muted-foreground">
          <span className="text-primary">$</span> {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy the install command"
          className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
