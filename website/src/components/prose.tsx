import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

/**
 * The elements every documentation page is written with.
 *
 * They exist so a page reads as content rather than as markup: a page file
 * should be a sequence of `<H2>`, `<P>` and `<Demo>`, with no class names in
 * sight.
 */

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{children}</p>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

/**
 * A section heading. The `id` is what the table of contents links to, so it has
 * to match the entry declared alongside the page.
 */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="group mt-14 scroll-mt-28 text-2xl font-semibold tracking-tight first:mt-0"
    >
      <a href={`#${id}`} className="no-underline">
        {children}
        <span className="ml-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
    </h2>
  )
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-9 scroll-mt-28 text-lg font-semibold tracking-tight">
      {children}
    </h3>
  )
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul>{children}</ul>
}

export function Ol({ children }: { children: ReactNode }) {
  return <ol>{children}</ol>
}

export function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}

/** Inline code. */
export function C({ children }: { children: ReactNode }) {
  return <code>{children}</code>
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http")

  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  )
}

/** A short run of prose set apart from the flow, without the noise of a card. */
export function Note({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "my-6 border-l-2 border-border pl-4 text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}
