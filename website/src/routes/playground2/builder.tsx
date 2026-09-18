import { useState } from "react"
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { BuilderStudio } from "@/demo/builder/BuilderStudio"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { BUILDER_KITS, type BuilderKit } from "@/demo/builder/kits"
import { deriveDocumentTitle } from "@/demo/playground2/deriveTitle"
import { cmsResource } from "@/demo/playground2/resources/cms"
import { profilesResource } from "@/demo/playground2/resources/profiles"
import { cn } from "@/lib/cn"

export const Route = createFileRoute("/playground2/builder")({
  head: () => ({
    meta: [
      { title: "Page builder — Playground2" },
      {
        name: "description",
        content:
          "The same page builder as /playground/builder, wired to save: publish a page or export a CV and it lands in playground2's CMS or My profiles.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Playground2BuilderRoute,
})

function resourceFor(kit: BuilderKit["id"]) {
  return kit === "resume" ? profilesResource : cmsResource
}

/**
 * `/playground/builder`, with its submit button wired to something: publishing
 * a page or exporting a CV saves it to the matching resource — `cmsResource`
 * or `profilesResource` — via the same `createItem` a form in that resource
 * would call. That resource's own storage is what CMS and My profiles read,
 * so the record shows up there the moment this screen writes it.
 */
function Playground2BuilderRoute() {
  const [kit, setKit] = useState<BuilderKit>(BUILDER_KITS[0])

  const handleSave = async (blocks: BuilderBlock[]) => {
    const resource = resourceFor(kit.id)
    const title = deriveDocumentTitle(kit.id, blocks)

    await resource.createItem({ title, blocks, updatedAt: new Date().toISOString() })

    toast.success(`"${title}" saved`, {
      description:
        kit.id === "resume" ? "Open it from My profiles." : "Open it from CMS.",
    })
  }

  return (
    <div className="mx-auto max-w-[100rem] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Link
          to="/playground2"
          className="mb-3 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to the back office
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Page builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Assemble a page or a CV, then publish it — it is saved to CMS or My
          profiles, whichever kit built it.
        </p>
      </div>

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

      <ClientOnly fallback={<BuilderSkeleton />}>
        <BuilderStudio key={kit.id} kit={kit} onSave={handleSave} />
      </ClientOnly>
    </div>
  )
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
