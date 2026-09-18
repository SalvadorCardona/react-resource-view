import { PAGE_HERO, RESUME_HEADER, type BuilderBlock } from "@/demo/builder/blocks"
import type { BuilderKit } from "@/demo/builder/kits"

/**
 * A title for a document the builder never asked one for.
 *
 * The block array has no field of its own for it, so it is read off the block
 * that already carries one — the hero's `title`, the résumé header's `name` —
 * the same way a reader would name the file. Falls back to a generic title
 * when that block is missing or still empty, rather than saving an untitled
 * record CMS or My profiles would have no good way to show.
 */
export function deriveDocumentTitle(kit: BuilderKit["id"], blocks: BuilderBlock[]): string {
  if (kit === "resume") {
    const header = blocks.find((block) => block.type === RESUME_HEADER)
    return (header?.name as string | undefined)?.trim() || "Untitled profile"
  }

  const hero = blocks.find((block) => block.type === PAGE_HERO)
  return (hero?.title as string | undefined)?.trim() || "Untitled page"
}
