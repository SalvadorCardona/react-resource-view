import blocksSource from "@/demo/builder/blocks.ts?raw"
import { CodeBlock } from "@/components/CodeBlock"
import { stripComments } from "@/lib/stripComments"

const SOURCE = stripComments(blocksSource)

/**
 * The file the palette is made of, read as text from the very module the
 * builder imports — so what it prints is what runs.
 *
 * Loaded lazily: the highlighter is the heaviest thing on the site, and a
 * reader who only came to drag a block around should not download it.
 */
export default function BuilderDeclaration() {
  return (
    <div className="overflow-hidden rounded-2xl border border-form/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-form-soft/50 px-4 py-2 text-xs">
        <span>
          <span className="font-mono">website/src/demo/builder/blocks.ts</span>
          <span className="text-muted-foreground"> — every block type there is</span>
        </span>
        <span className="text-muted-foreground">
          {SOURCE.split("\n").length} lines, comments stripped
        </span>
      </div>
      <CodeBlock
        lang="ts"
        className="my-0 max-h-[32rem] overflow-y-auto rounded-none border-0"
      >
        {SOURCE}
      </CodeBlock>
    </div>
  )
}
