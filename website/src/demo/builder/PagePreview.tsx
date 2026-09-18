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
 *
 * It draws a published page rather than a panel of the back office: the frame,
 * the paper and the theme come from `BuilderCanvas`, and the measure below —
 * prose at around 68 characters, headings in a serif — is the one an article
 * is read at, not the one a form is filled in at.
 */
export function PagePreview({ blocks }: { blocks: BuilderBlock[] }) {
  if (blocks.length === 0) return <EmptyPage />

  return (
    <article className="pb-10">
      {blocks.map((block, index) => (
        <Block key={block.id ?? index} block={block} />
      ))}
    </article>
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

/** The measure prose is read at, and the gutters everything else lines up on. */
const COLUMN = "mx-auto w-full max-w-[38rem] px-6 sm:px-8"

function Hero({ block }: { block: BuilderBlock }) {
  const src = artworkSrc(block.image as string)
  const centred = block.align !== "left"

  return (
    <section className="relative isolate mb-10 overflow-hidden px-6 py-20 sm:px-10 sm:py-28">
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/25 to-view/25" />
      )}
      {/* Dark at the foot, clear at the head: the words sit on the deepest part
          of the picture, which is what keeps them readable whatever is behind. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/55 to-slate-950/30" />

      <div
        className={cn(
          "mx-auto max-w-[38rem] text-white",
          centred ? "text-center" : "text-left"
        )}
      >
        {typeof block.eyebrow === "string" && block.eyebrow && (
          <p
            className={cn(
              "mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase backdrop-blur-sm"
            )}
          >
            {block.eyebrow}
          </p>
        )}
        <h2 className="font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
          {(block.title as string) || "Your title"}
        </h2>
        {typeof block.subtitle === "string" && block.subtitle && (
          <p
            className={cn(
              "mt-5 text-[17px] leading-relaxed text-white/85",
              centred && "mx-auto"
            )}
          >
            {block.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

function Text({ block }: { block: BuilderBlock }) {
  return (
    <section className={cn(COLUMN, "py-6")}>
      {typeof block.title === "string" && block.title && (
        <h3 className="mb-4 font-serif text-2xl font-semibold tracking-tight">
          {block.title}
        </h3>
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
      className="prose-docs max-w-none text-[17px] leading-[1.7]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function Figure({ block }: { block: BuilderBlock }) {
  const src = artworkSrc((block.upload as string) || (block.image as string))
  const full = block.width === "full"

  return (
    <figure className={cn("py-6", full ? "px-0" : COLUMN)}>
      {src ? (
        <img
          src={src}
          alt={(block.caption as string) ?? ""}
          className={cn(
            "w-full object-cover",
            full ? "max-h-96" : "max-h-80 rounded-lg"
          )}
        />
      ) : (
        <Placeholder label="Pick an image" />
      )}
      {typeof block.caption === "string" && block.caption && (
        <figcaption
          className={cn(
            "mt-3 text-[13px] text-muted-foreground",
            full ? COLUMN : "px-0"
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
    <section className="mx-auto w-full max-w-[52rem] px-6 py-8 sm:px-8">
      {typeof block.title === "string" && block.title && (
        <h3 className="mb-5 font-serif text-2xl font-semibold tracking-tight">
          {block.title}
        </h3>
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
          {images.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={artworkSrc(image)}
              alt=""
              className="aspect-[4/3] w-full rounded-lg object-cover"
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
    <section className={cn(COLUMN, "py-8")}>
      <blockquote className="border-l-2 border-primary/60 pl-6">
        <p className="font-serif text-2xl leading-snug font-medium text-balance">
          “{(block.quote as string) || "Say something worth quoting."}”
        </p>
        {(author || role) && (
          <footer className="mt-4 text-[13px] tracking-wide text-muted-foreground">
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
    <section className="mx-auto w-full max-w-[52rem] px-6 py-8 sm:px-8">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-view/12 p-10 text-center">
        <h3 className="font-serif text-2xl font-semibold tracking-tight">
          {(block.title as string) || "Ready?"}
        </h3>
        {typeof block.description === "string" && block.description && (
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {block.description}
          </p>
        )}
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
          {(block.action as string) || "Get started"}
          <ArrowRight className="size-4" />
        </span>
      </div>
    </section>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  )
}

/**
 * Nothing written yet — and what a page is made of, drawn as the bones of one:
 * a dashed rectangle says the preview is broken, this says it is waiting.
 */
function EmptyPage() {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-4 px-6 text-center">
      <div aria-hidden className="w-full max-w-56 space-y-2">
        <div className="h-16 rounded-md bg-muted" />
        <div className="h-2.5 w-2/3 rounded-full bg-muted" />
        <div className="h-2.5 rounded-full bg-muted/70" />
        <div className="h-2.5 w-5/6 rounded-full bg-muted/70" />
      </div>
      <p className="text-sm text-muted-foreground">
        Add a block, and the page draws itself here.
      </p>
    </div>
  )
}
