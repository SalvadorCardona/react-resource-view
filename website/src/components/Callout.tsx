import type { ReactNode } from "react"
import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react"
import { cn } from "@/lib/cn"

type CalloutKind = "note" | "tip" | "warning" | "danger"

const KINDS = {
  note: {
    icon: Info,
    label: "Note",
    className: "border-border bg-muted/50",
    iconClassName: "text-muted-foreground",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className: "border-primary/25 bg-accent/40",
    iconClassName: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    label: "Careful",
    className: "border-form/35 bg-form-soft/50",
    iconClassName: "text-form",
  },
  danger: {
    icon: OctagonAlert,
    label: "Gotcha",
    className: "border-destructive/30 bg-destructive/5",
    iconClassName: "text-destructive",
  },
} as const satisfies Record<CalloutKind, unknown>

export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: CalloutKind
  title?: string
  children: ReactNode
}) {
  const { icon: Icon, label, className, iconClassName } = KINDS[kind]

  return (
    <div className={cn("my-6 rounded-xl border p-4 text-sm", className)}>
      <p className="mb-1.5 flex items-center gap-2 font-semibold">
        <Icon className={cn("size-4 shrink-0", iconClassName)} />
        {title ?? label}
      </p>
      <div className="text-muted-foreground [&>p]:my-1">{children}</div>
    </div>
  )
}
