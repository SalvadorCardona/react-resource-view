import { useState } from "react"
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { BuilderStudio } from "@/demo/builder/BuilderStudio"
import type { BuilderBlock } from "@/demo/builder/blocks"
import { BUILDER_KITS, type BuilderKit } from "@/demo/builder/kits"
import {
  deriveDocumentTitle,
  deriveResumeOwner,
} from "@/demo/playground/deriveTitle"
// Through the barrel rather than the two files: importing it is also what
// seeds the collections this screen writes into.
import { postsResource, profilesResource } from "@/demo/playground/resources"
import { cn } from "@/lib/cn"

export const Route = createFileRoute("/playground/builder")({
  head: () => ({
    meta: [
      { title: "Page builder — Playground" },
      {
        name: "description",
        content:
          "One form whose fields the reader decides: assemble a page out of blocks, or a CV, and publish it — it is saved to the back office, as a post or as a CV under an account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlaygroundBuilderRoute,
})

/**
 * The builder, with its submit button wired to something: publishing a page
 * saves it as a post, exporting a CV saves it under the account whose name is
 * on it — through the same `createItem` a form of that resource would call.
 * Those resources' own storage is what the back office reads, so the record
 * shows up there the moment this screen writes it.
 */
function PlaygroundBuilderRoute() {
  const [kit, setKit] = useState<BuilderKit>(BUILDER_KITS[0])

  const handleSave = async (blocks: BuilderBlock[]) => {
    const title = deriveDocumentTitle(kit.id, blocks)

    if (kit.id === "resume") {
      const owner = deriveResumeOwner(blocks)

      await profilesResource.createItem({
        title,
        owner,
        blocks,
        updatedAt: new Date().toISOString(),
      })

      toast.success(`"${title}" saved`, {
        description: owner
          ? `Open it from ${owner}'s Curriculum vitæ tab.`
          : "Open it from any account's Curriculum vitæ tab — this one names nobody.",
      })
      return
    }

    // A page is a post like any other: it lands in the blog as a draft, under
    // the category the back office lists the pages of the site under.
    await postsResource.createItem({
      title,
      blocks,
      category: "Pages",
      status: "draft",
      author: "",
      publishedAt: "",
      views: 0,
    })

    toast.success(`"${title}" saved`, {
      description: "Open it from Posts — it is a draft until you publish it.",
    })
  }

  return (
    <div className="mx-auto max-w-[100rem] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Link
          to="/playground"
          className="mb-3 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to the back office
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Page builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Assemble a page or a CV, then publish it — a page is saved as a post,
          a CV under the account it names.
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
