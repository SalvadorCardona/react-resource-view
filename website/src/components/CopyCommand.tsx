import { useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * A shell command and the button that copies it.
 *
 * `InstallCommand` copies an install line in the reader's package manager; this
 * one is a command run as it is, so it only keeps the copying.
 */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <code className="min-w-0 font-mono text-xs text-foreground sm:overflow-x-auto sm:whitespace-nowrap">
        <span className="text-view">$</span> {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy the command"
        className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5 text-view" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  )
}
