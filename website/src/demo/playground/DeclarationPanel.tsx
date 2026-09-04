import { CodeBlock } from "@/components/CodeBlock"
import type { Declaration } from "@/demo/playground/declarations"

/**
 * The file behind the screen on show, read as text from the very module the
 * scope imports — so what it prints is what runs.
 *
 * Loaded lazily by the shell: the highlighter it pulls in is the heaviest
 * thing on the site, and a reader who never presses "Declaration" should not
 * download it to see a table.
 */
export default function DeclarationPanel({
  declaration,
}: {
  declaration: Declaration
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-view/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-view-soft/60 px-4 py-2 text-xs">
        <span>
          <span className="font-mono">website/src/demo/playground/{declaration.file}</span>
          <span className="text-muted-foreground"> — the whole screen</span>
        </span>
        <span className="text-muted-foreground">
          {declaration.lines} lines, comments stripped
        </span>
      </div>
      <CodeBlock
        lang="ts"
        className="my-0 max-h-[32rem] overflow-y-auto rounded-none border-0"
      >
        {declaration.source}
      </CodeBlock>
    </div>
  )
}
