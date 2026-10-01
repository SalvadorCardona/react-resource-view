import { useCallback, useEffect, useRef, useState } from "react"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { envelopeOf, useRenderedEmail } from "@/demo/email/emailDocument"
import { brandColor } from "@/demo/email/renderEmail"

/**
 * The email, as a mailbox shows it: the line of the inbox — sender, subject,
 * preheader in grey — and the message opened under it.
 *
 * The message is not drawn by React components that resemble it: it is the
 * HTML `renderEmail` produced, the very string the export and the test send
 * ship, in an `<iframe srcdoc>`. The frame keeps the site's stylesheet out of
 * it, so what is seen here owes nothing to Tailwind — the one way to trust a
 * preview of something that will be read in Gmail.
 *
 * The frame runs no script (`sandbox` without `allow-scripts`); same-origin is
 * kept so its height can be read, and popups so a link opens a new tab.
 */
export function EmailPreview({
  blocks,
  fields,
}: {
  blocks: BuilderBlock[]
  fields?: Record<string, unknown>
}) {
  const { html } = useRenderedEmail(blocks, fields)
  const envelope = envelopeOf(fields)
  const sender = envelope.fromName?.trim() || "Sender"
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(640)

  // The frame grows to the message rather than scrolling inside a scroll: the
  // canvas around it already scrolls. The message's own body is watched, so a
  // narrower frame — the phone — is followed by a taller one.
  const observer = useRef<ResizeObserver | null>(null)

  const handleLoad = useCallback(() => {
    const body = frame.current?.contentDocument?.body
    if (!body) return
    // The frame is as tall as the message, so it never needs a scrollbar — and
    // one appearing for a frame's time would narrow the message, which grows,
    // which keeps the scrollbar. Set on the live document, not on the HTML.
    body.ownerDocument.documentElement.style.overflow = "hidden"

    const measure = () =>
      setHeight(Math.max(240, Math.ceil(body.getBoundingClientRect().height)))
    measure()

    observer.current?.disconnect()
    if (typeof ResizeObserver === "undefined") return
    observer.current = new ResizeObserver(measure)
    observer.current.observe(body)
  }, [])

  useEffect(() => () => observer.current?.disconnect(), [])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_32px_-12px_rgba(15,23,42,0.25)]">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: brandColor(envelope.brandColor) }}
        >
          {sender.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold">{sender}</span>
            <span className="shrink-0 text-xs text-muted-foreground">now</span>
          </div>
          <p className="truncate text-sm">
            <span className="font-medium">{envelope.subject || "(no subject)"}</span>
            {envelope.preheader && (
              <span className="text-muted-foreground"> — {envelope.preheader}</span>
            )}
          </p>
        </div>
      </div>

      <iframe
        ref={frame}
        title="The email, as it is sent"
        srcDoc={html}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={handleLoad}
        style={{ height }}
        className="block w-full border-0 bg-[#f4f1ec]"
      />
    </div>
  )
}
