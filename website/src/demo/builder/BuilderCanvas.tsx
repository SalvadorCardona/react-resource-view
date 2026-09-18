import { useState, type FC, type ReactNode } from "react"
import { Braces, Eye, Monitor, Smartphone, Tablet } from "lucide-react"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { cn } from "@/lib/cn"

/**
 * What the blocks add up to, framed as the thing they will become.
 *
 * The preview used to be a card in the middle of the back office: same
 * background, same typography, same rounded border as the form beside it, so
 * the page being written never looked like a page. Here it is a sheet lying on
 * a desk — its own theme, its own width, a shadow under it — which is the whole
 * difference between previewing and editing.
 */

export type CanvasMedium = "page" | "sheet"

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "max-w-none" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "max-w-3xl" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "max-w-[24rem]" },
] as const

export function BuilderCanvas({
  blocks,
  preview: Preview,
  medium = "page",
  toolbarEnd,
}: {
  blocks: BuilderBlock[]
  preview: FC<{ blocks: BuilderBlock[] }>
  /** A web page lies flat and stretches; a CV is a sheet of A4 and does not. */
  medium?: CanvasMedium
  /** Whatever the screen wants beside the toolbar — a save state, a count. */
  toolbarEnd?: ReactNode
}) {
  const [tab, setTab] = useState<"preview" | "payload">("preview")
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop")
  const width = DEVICES.find((item) => item.id === device)?.width

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
          <Toggle active={tab === "preview"} onClick={() => setTab("preview")}>
            <Eye className="size-3.5" />
            Result
          </Toggle>
          <Toggle active={tab === "payload"} onClick={() => setTab("payload")}>
            <Braces className="size-3.5" />
            Payload
          </Toggle>
        </div>

        {/* A CV is the same width on every screen there is, so the switch would
            be three buttons doing nothing. */}
        {medium === "page" && tab === "preview" && (
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
            {DEVICES.map((item) => (
              <Toggle
                key={item.id}
                active={device === item.id}
                onClick={() => setDevice(item.id)}
                label={item.label}
              >
                <item.icon className="size-3.5" />
              </Toggle>
            ))}
          </div>
        )}

        {toolbarEnd && <div className="ml-auto">{toolbarEnd}</div>}
      </div>

      {tab === "payload" ? (
        <pre className="max-h-[calc(100dvh-14rem)] overflow-auto rounded-2xl border border-border bg-code-bg p-4 font-mono text-[11px] leading-relaxed">
          {JSON.stringify(blocks, null, 2)}
        </pre>
      ) : (
        <div
          className={cn(
            "overflow-y-auto rounded-2xl bg-muted/40 p-3 sm:p-6",
            "max-h-[calc(100dvh-14rem)]",
            // The chequer of a design tool, faint enough to stay a texture.
            "bg-[radial-gradient(var(--grid-line)_1px,transparent_1px)] [background-size:16px_16px]"
          )}
        >
          <div
            className={cn(
              "builder-paper mx-auto overflow-hidden bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_32px_-12px_rgba(15,23,42,0.25)]",
              medium === "sheet"
                ? "min-h-[58rem] max-w-[44rem] rounded-sm"
                : cn("rounded-xl", width)
            )}
          >
            <Preview blocks={blocks} />
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  /** Set when the button is an icon on its own. */
  label?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
