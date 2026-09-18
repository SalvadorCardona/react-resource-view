import {
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_HEADER,
  RESUME_SKILLS,
  type BuilderBlock,
} from "@/demo/builder/blocks"
import { artworkSrc } from "@/demo/builder/media"

/**
 * The same blocks, drawn as a curriculum vitæ.
 *
 * Nothing here is a second mechanism: it is the second answer to the question
 * a page builder already asks. A résumé is a list of sections that are not the
 * same shape as one another — an identity, then experiences, then a wall of
 * skills — which is exactly what a form with a palette describes, and exactly
 * what a form with a fixed list of fields cannot.
 *
 * What it is not is a list of cards: a CV is read as a document, so the blocks
 * that follow one another are gathered under one heading, and the typography
 * below is a document's — a name, small capitals over a rule, and a body at
 * thirteen points.
 */
export function ResumePreview({ blocks }: { blocks: BuilderBlock[] }) {
  if (blocks.length === 0) return <EmptyResume />

  return (
    <div className="px-10 py-12 sm:px-14">
      {group(blocks).map((section, index) => (
        <Section key={section.items[0].id ?? index} section={section} />
      ))}
    </div>
  )
}

interface Group {
  type?: string
  items: BuilderBlock[]
}

/** The heading a run of blocks is gathered under — none for the one-offs. */
const HEADINGS: Record<string, string> = {
  [RESUME_EXPERIENCE]: "Experience",
  [RESUME_EDUCATION]: "Education",
}

/**
 * Consecutive blocks of the same kind, as one section.
 *
 * Three jobs in a row are one "Experience" on paper, and stay three blocks in
 * the outline — which is the split this whole builder rests on: the record is
 * a flat list, the document is not.
 */
function group(blocks: BuilderBlock[]): Group[] {
  const groups: Group[] = []

  for (const block of blocks) {
    const last = groups.at(-1)

    if (last && last.type === block.type && HEADINGS[block.type ?? ""]) {
      last.items.push(block)
      continue
    }

    groups.push({ type: block.type, items: [block] })
  }

  return groups
}

function Section({ section }: { section: Group }) {
  const heading = HEADINGS[section.type ?? ""]

  return (
    <section className="mt-8 first:mt-0">
      {heading && (
        <h4 className="mb-4 border-b border-border pb-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {heading}
        </h4>
      )}
      <div className="space-y-5">
        {section.items.map((block, index) => (
          <Block key={block.id ?? index} block={block} />
        ))}
      </div>
    </section>
  )
}

function Block({ block }: { block: BuilderBlock }) {
  switch (block.type) {
    case RESUME_HEADER:
      return <Identity block={block} />
    case RESUME_EXPERIENCE:
      return <Experience block={block} />
    case RESUME_EDUCATION:
      return <Education block={block} />
    case RESUME_SKILLS:
      return <Skills block={block} />
    default:
      return null
  }
}

function Identity({ block }: { block: BuilderBlock }) {
  const portrait = artworkSrc(block.portrait as string)
  const contact = Array.isArray(block.contact) ? (block.contact as string[]) : []

  return (
    <header className="flex flex-wrap items-start gap-6 border-b border-foreground/15 pb-6">
      {portrait && (
        <img
          src={portrait}
          alt=""
          className="size-24 shrink-0 rounded-full object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-[2rem] leading-tight font-semibold tracking-tight">
          {(block.name as string) || "Your name"}
        </h3>
        {typeof block.role === "string" && block.role && (
          <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
            {block.role}
          </p>
        )}
        {typeof block.summary === "string" && block.summary && (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {block.summary}
          </p>
        )}
        {contact.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            {contact.map((line, index) => (
              <li key={`${line}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden className="text-border">·</span>}
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}

function Experience({ block }: { block: BuilderBlock }) {
  const stack = Array.isArray(block.stack) ? (block.stack as string[]) : []

  return (
    <article className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:pt-1">
        {(block.period as string) || "—"}
      </p>

      <div>
        <h5 className="text-[15px] font-semibold">
          {(block.role as string) || "Position"}
          {typeof block.company === "string" && block.company && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {block.company}
            </span>
          )}
        </h5>
        {typeof block.description === "string" && block.description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {block.description}
          </p>
        )}
        {stack.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {stack.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

function Education({ block }: { block: BuilderBlock }) {
  return (
    <article className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:pt-0.5">
        {(block.period as string) || "—"}
      </p>
      <p className="text-[13px]">
        <span className="font-semibold">{(block.degree as string) || "Degree"}</span>
        {typeof block.school === "string" && block.school && (
          <span className="text-muted-foreground"> · {block.school}</span>
        )}
      </p>
    </article>
  )
}

function Skills({ block }: { block: BuilderBlock }) {
  const skills = Array.isArray(block.skills) ? (block.skills as string[]) : []

  return (
    <div>
      <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {(block.title as string) || "Skills"}
      </h4>
      {skills.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Nothing listed yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill, index) => (
            <li
              key={`${skill}-${index}`}
              className="rounded-full border border-border px-3 py-1 text-[11px] font-medium"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** The bones of a CV, rather than an empty frame saying nothing is there. */
function EmptyResume() {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-5 px-10 text-center">
      <div aria-hidden className="w-full max-w-64 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 rounded-full bg-muted" />
            <div className="h-2 w-1/3 rounded-full bg-muted/70" />
          </div>
        </div>
        <div className="h-px bg-muted" />
        <div className="h-2 rounded-full bg-muted/70" />
        <div className="h-2 w-5/6 rounded-full bg-muted/70" />
      </div>
      <p className="text-sm text-muted-foreground">
        Add a section, and the résumé draws itself here.
      </p>
    </div>
  )
}
