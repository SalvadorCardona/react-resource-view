import { PAGE_HERO, RESUME_HEADER, type BuilderBlock } from "@/demo/builder/blocks"
import type { BuilderKit } from "@/demo/builder/kits"

/**
 * A title for a document the builder never asked one for.
 *
 * The block array has no field of its own for it, so it is read off the block
 * that already carries one — the hero's `title`, the résumé header's `name` and
 * `role` — the same way a reader would name the file. Falls back to a generic
 * title when that block is missing or still empty, rather than saving an
 * untitled record the back office would have no good way to show.
 */
export function deriveDocumentTitle(
  kit: BuilderKit["id"],
  blocks: BuilderBlock[]
): string {
  if (kit === "resume") {
    const name = deriveResumeOwner(blocks)
    if (!name) return "Untitled CV"

    const role = resumeHeaderField(blocks, "role")
    return role ? `${name} — ${role}` : name
  }

  const hero = blocks.find((block) => block.type === PAGE_HERO)
  return (hero?.title as string | undefined)?.trim() || "Untitled page"
}

/**
 * Who a CV belongs to: the name on its identity block.
 *
 * It is the field the account's "Curriculum vitæ" tab filters on, so a CV
 * exported from the builder shows up under the user of the same name — and
 * under nobody, visibly, when the block was left empty.
 */
export function deriveResumeOwner(blocks: BuilderBlock[]): string {
  return resumeHeaderField(blocks, "name")
}

function resumeHeaderField(blocks: BuilderBlock[], key: string): string {
  const header = blocks.find((block) => block.type === RESUME_HEADER)
  return (header?.[key] as string | undefined)?.trim() ?? ""
}
