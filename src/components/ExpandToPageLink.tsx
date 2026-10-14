import { MouseEvent } from "react"
import { translate } from "react-mini-i18n"
import { Maximize2 } from "lucide-react"
import { Link } from "@/ports"
import { buttonVariants } from "@/ui/button"
import { cn } from "@/ui/cn"

export interface ExpandToPageLinkProps {
  /** The URL of the same view on its own page. */
  to: string
  /** Called on a plain click, before the router goes there — not on Ctrl/Cmd+click. */
  onNavigate?: () => void
  className?: string
}

/**
 * "Open in full page", drawn in the header of a dialog or a drawer beside its
 * close button: the same view on its own page, for a record too long for the
 * window. A real link, so Ctrl/Cmd+click and the middle button open it in a
 * new tab and leave the window where it is.
 */
export function ExpandToPageLink({
  to,
  onNavigate,
  className,
}: ExpandToPageLinkProps) {
  const label = translate("Open in full page")

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return
    onNavigate?.()
  }

  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      data-slot="expand-to-page"
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        // Beside the close button, which sits `top-4 right-4` in both frames.
        "absolute top-4 right-14 z-10 bg-secondary",
        className
      )}
    >
      <Maximize2 />
    </Link>
  )
}
