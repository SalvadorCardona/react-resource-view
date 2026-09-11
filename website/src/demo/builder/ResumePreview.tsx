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
 */
export function ResumePreview({ blocks }: { blocks: BuilderBlock[] }) {
  if (blocks.length === 0) return <EmptyResume />

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      {blocks.map((block, index) => (
        <Block key={block.id ?? index} block={block} />
      ))}
    </div>
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
    <header className="flex flex-wrap items-start gap-5 border-b border-border pb-6">
      {portrait && (
        <img
          src={portrait}
          alt=""
          className="size-20 shrink-0 rounded-2xl object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-semibold tracking-tight">
          {(block.name as string) || "Your name"}
        </h3>
        {typeof block.role === "string" && block.role && (
          <p className="text-sm font-medium text-primary">{block.role}</p>
        )}
        {typeof block.summary === "string" && block.summary && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {block.summary}
          </p>
        )}
        {contact.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {contact.map((line) => (
              <li key={line}>{line}</li>
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
    <section className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:pt-1">
        {(block.period as string) || "—"}
      </p>

      <div>
        <h4 className="font-semibold">
          {(block.role as string) || "Position"}
          {typeof block.company === "string" && block.company && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {block.company}
            </span>
          )}
        </h4>
        {typeof block.description === "string" && block.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {block.description}
          </p>
        )}
        {stack.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {stack.map((item) => (
              <li
                key={item}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Education({ block }: { block: BuilderBlock }) {
  return (
    <section className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:pt-1">
        {(block.period as string) || "—"}
      </p>
      <p className="text-sm">
        <span className="font-semibold">{(block.degree as string) || "Degree"}</span>
        {typeof block.school === "string" && block.school && (
          <span className="text-muted-foreground"> · {block.school}</span>
        )}
      </p>
    </section>
  )
}

function Skills({ block }: { block: BuilderBlock }) {
  const skills = Array.isArray(block.skills) ? (block.skills as string[]) : []

  return (
    <section>
      <h4 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {(block.title as string) || "Skills"}
      </h4>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing listed yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyResume() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
      Add a section, and the résumé draws itself here.
    </div>
  )
}
