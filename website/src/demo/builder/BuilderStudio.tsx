import { useState } from "react"
import { FormElement, useForm } from "react-data-form"
import { Braces, Eye, RotateCcw } from "lucide-react"
import type { BuilderBlock } from "@/demo/builder/blocks"
import type { BuilderKit } from "@/demo/builder/kits"
import { cn } from "@/lib/cn"

/**
 * The builder itself: the description on the left, what it produces on the
 * right, both live.
 *
 * Everything the reader edits goes through one field. `useForm`'s `onChange`
 * fires on every keystroke and hands back the whole payload, so the preview is
 * not wired to the form — it is a function of the array the form holds, which
 * is all an application would have to store.
 */
export function BuilderStudio({
  kit,
  sample = kit.sample,
}: {
  kit: BuilderKit
  /** What it opens on — a documentation page starts from fewer blocks. */
  sample?: BuilderBlock[]
}) {
  // Remounting is how the sample is restored: the array field keeps its own
  // state, so putting the blocks back means building the form again.
  const [generation, setGeneration] = useState(0)

  return (
    <Studio
      key={`${kit.id}-${generation}`}
      kit={kit}
      sample={sample}
      onReset={() => setGeneration((value) => value + 1)}
    />
  )
}

function Studio({
  kit,
  sample,
  onReset,
}: {
  kit: BuilderKit
  sample: BuilderBlock[]
  onReset: () => void
}) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(sample)
  const [tab, setTab] = useState<"preview" | "payload">("preview")

  const formContext = useForm({
    form: kit.form,
    data: { blocks: sample },
    // The second argument is the updated form; its data is the payload as it
    // stands after the keystroke, which is what the preview draws.
    onChange: (_, form) => setBlocks((form.data?.blocks as BuilderBlock[]) ?? []),
  })

  const Preview = kit.preview

  // A container query rather than a breakpoint: the studio runs at full width
  // in the playground and inside the column of a documentation page, and what
  // decides whether the result fits beside the description is the room this
  // component was given, not the size of the window.
  return (
    <div className="@container">
      <div className="grid items-start gap-6 @5xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="order-2 min-w-0 @5xl:order-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {blocks.length} block{blocks.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>

          <FormElement {...formContext} />
        </div>

        {/* Beside the description when there is room, above it when there is
            not: stacked, the result is what the reader should meet first. */}
        <div className="order-1 min-w-0 @5xl:sticky @5xl:top-24 @5xl:order-2 @5xl:max-h-[calc(100dvh-8rem)] @5xl:overflow-y-auto">
          <div className="mb-3 flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5 @5xl:w-fit">
            <TabButton
              active={tab === "preview"}
              onClick={() => setTab("preview")}
              icon={Eye}
            >
              Result
            </TabButton>
            <TabButton
              active={tab === "payload"}
              onClick={() => setTab("payload")}
              icon={Braces}
            >
              Payload
            </TabButton>
          </div>

          {tab === "preview" ? (
            <Preview blocks={blocks} />
          ) : (
            <pre className="max-h-[36rem] overflow-auto rounded-2xl border border-border bg-code-bg p-4 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Eye
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  )
}
