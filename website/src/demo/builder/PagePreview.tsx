import { ArrowRight } from "lucide-react"
import {
  PAGE_CTA,
  PAGE_GALLERY,
  PAGE_HERO,
  PAGE_IMAGE,
  PAGE_QUOTE,
  PAGE_TEXT,
  type BuilderBlock,
} from "@/demo/builder/blocks"
import { artworkSrc } from "@/demo/builder/media"
import { cn } from "@/lib/cn"

/**
 * The landing page the blocks describe, drawn.
 *
 * This is the half of a page builder the library does not write for you, and
 * that is the point worth seeing: the form produces an array of typed objects,
 * and a component of the application decides what each type looks like. Change
 * the drawing here and the description above it does not move; add a block type
 * to the palette and the only thing to write is a branch in `Block`.
 */
export function PagePreview({ blocks }: { blocks: BuilderBlock[] }) {
  if (blocks.length === 0) return <EmptyPage />

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {blocks.map((block, index) => (
        <Block key={block.id ?? index} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: BuilderBlock }) {
  switch (block.type) {
    case PAGE_HERO:
      return <Hero block={block} />
    case PAGE_TEXT:
      return <Text block={block} />
    case PAGE_IMAGE:
      return <Figure block={block} />
    case PAGE_GALLERY:
      return <Gallery block={block} />
    case PAGE_QUOTE:
      return <Pull block={block} />
    case PAGE_CTA:
      return <Cta block={block} />
    default:
      return null
  }
}

function Hero({ block }: { block: BuilderBlock }) {
  const src = artworkSrc(block.image as string)
  const centred = block.align !== "left"

  return (
    <section className="relative isolate overflow-hidden px-6 py-16 sm:px-10 sm:py-20">
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/25 to-view/25" />
      )}
      <div className="absolute inset-0 -z-10 bg-slate-950/55" />

      <div className={cn("max-w-2xl text-white", centred && "mx-auto text-center")}>
        {typeof block.eyebrow === "string" && block.eyebrow && (
          <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
            {block.eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {(block.title as string) || "Your title"}
        </h2>
        {typeof block.subtitle === "string" && block.subtitle && (
          <p className="mt-4 text-base leading-relaxed text-white/80">
            {block.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

function Text({ block }: { block: BuilderBlock }) {
  return (
    <section className="px-6 py-10 sm:px-10">
      {typeof block.title === "string" && block.title && (
        <h3 className="mb-3 text-xl font-semibold tracking-tight">{block.title}</h3>
      )}
      <Body html={block.body as string} />
    </section>
  )
}

/**
 * The rich text of a block.
 *
 * `WysiwygInputController` hands back HTML, which has to be set as HTML for the
 * bold to be bold. It is the reader's own keystrokes, produced by the editor
 * two panels away and never leaving this browser — no third party writes into
 * this string.
 */
function Body({ html }: { html?: string }) {
  if (!html) {
    return <p className="text-sm text-muted-foreground">Write something…</p>
  }

  return (
    <div
      className="prose-docs max-w-none text-[15px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function Figure({ block }: { block: BuilderBlock }) {
  const src = artworkSrc((block.upload as string) || (block.image as string))
  const full = block.width === "full"

  return (
    <figure className={cn("py-6", full ? "px-0" : "px-6 sm:px-10")}>
      {src ? (
        <img
          src={src}
          alt={(block.caption as string) ?? ""}
          className={cn(
            "w-full object-cover",
            full ? "max-h-80" : "max-h-72 rounded-xl"
          )}
        />
      ) : (
        <Placeholder label="Pick an image" />
      )}
      {typeof block.caption === "string" && block.caption && (
        <figcaption
          className={cn(
            "mt-2 text-xs text-muted-foreground",
            full && "px-6 sm:px-10"
          )}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function Gallery({ block }: { block: BuilderBlock }) {
  const images = Array.isArray(block.images) ? (block.images as string[]) : []

  return (
    <section className="px-6 py-10 sm:px-10">
      {typeof block.title === "string" && block.title && (
        <h3 className="mb-4 text-xl font-semibold tracking-tight">{block.title}</h3>
      )}
      {images.length === 0 ? (
        <Placeholder label="Pick a few images" />
      ) : (
        <div
          className={cn(
            "grid gap-3",
            block.columns === "2" ? "sm:grid-cols-2" : "sm:grid-cols-3"
          )}
        >
          {images.map((image) => (
            <img
              key={image}
              src={artworkSrc(image)}
              alt=""
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Pull({ block }: { block: BuilderBlock }) {
  const author = block.author as string | undefined
  const role = block.role as string | undefined

  return (
    <section className="px-6 py-10 sm:px-10">
      <blockquote className="border-l-2 border-primary pl-5">
        <p className="text-lg leading-relaxed font-medium text-balance">
          “{(block.quote as string) || "Say something worth quoting."}”
        </p>
        {(author || role) && (
          <footer className="mt-3 text-sm text-muted-foreground">
            {author}
            {author && role ? " — " : ""}
            {role}
          </footer>
        )}
      </blockquote>
    </section>
  )
}

function Cta({ block }: { block: BuilderBlock }) {
  return (
    <section className="px-6 py-10 sm:px-10">
      <div className="rounded-2xl bg-gradient-to-br from-primary/12 to-view/12 p-8 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          {(block.title as string) || "Ready?"}
        </h3>
        {typeof block.description === "string" && block.description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {block.description}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          {(block.action as string) || "Get started"}
          <ArrowRight className="size-4" />
        </span>
      </div>
    </section>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function EmptyPage() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
      Add a block, and the page draws itself here.
    </div>
  )
}
