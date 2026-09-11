import { lazy, Suspense, useState } from "react"
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router"
import { Code2 } from "lucide-react"
import { BuilderStudio } from "@/demo/builder/BuilderStudio"
import { BUILDER_KITS, type BuilderKit } from "@/demo/builder/kits"
import { cn } from "@/lib/cn"

// The panel carries the syntax highlighter, which nothing else on this page
// needs; it arrives when the reader asks for it.
const BuilderDeclaration = lazy(() => import("@/demo/builder/BuilderDeclaration"))

export const Route = createFileRoute("/playground/builder")({
  head: () => ({
    meta: [
      { title: "Page builder — Resource & Form" },
      {
        name: "description",
        content:
          "Assemble a landing page — hero, prose, gallery, quote, call to action — or a curriculum vitæ, block by block, out of one form field. The palette, the ordering and the payload all come from react-data-form.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BuilderRoute,
})

/**
 * The asymmetric form, at full size.
 *
 * The documentation page explains the mechanism in two hundred words; this is
 * the same mechanism with room to be used — six block types, a palette, drag
 * to reorder, and a result that redraws as it is typed. The two documents on
 * offer are deliberately unrelated to each other: what they share is a single
 * field, and the fact that neither of their shapes is known when the
 * description is written.
 */
function BuilderRoute() {
  const [kit, setKit] = useState<BuilderKit>(BUILDER_KITS[0])
  const [showDeclaration, setShowDeclaration] = useState(false)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Page builder</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            One field, a palette of blocks, and a document that is a different shape
            every time.{" "}
            <Link
              to="/docs/form/asymmetric"
              className="text-foreground underline underline-offset-4"
            >
              How it is described
            </Link>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeclaration((value) => !value)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition",
            showDeclaration
              ? "border-form/50 bg-form-soft/50 text-foreground"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Code2 className="size-4" />
          Declaration
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
        {BUILDER_KITS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setKit(option)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              option.id === kit.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/25 hover:bg-muted/40"
            )}
          >
            <option.icon
              className={cn(
                "mt-0.5 size-5 shrink-0",
                option.id === kit.id ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-muted-foreground">
                {option.tagline}
              </span>
            </span>
          </button>
        ))}
      </div>

      {showDeclaration && (
        <Suspense fallback={<DeclarationSkeleton />}>
          <BuilderDeclaration />
        </Suspense>
      )}

      <ClientOnly fallback={<BuilderSkeleton />}>
        <BuilderStudio kit={kit} />
      </ClientOnly>
    </div>
  )
}

function DeclarationSkeleton() {
  return <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-hidden />
}

function BuilderSkeleton() {
  return (
    <div className="@container" aria-hidden>
      <div className="grid animate-pulse items-start gap-6 @5xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="h-28 w-full rounded-xl bg-muted" />
          <div className="h-28 w-full rounded-xl bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
        </div>
        <div className="h-96 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
