import { useCurrentViewResourceContext } from "react-resource-view"
import { POSTS_ID, readStudioRows, type Post, type User } from "@/demo/playground2/data"

/**
 * The second shape a sub-view takes: a tab of one's own, with no resource
 * behind it.
 *
 * Same screen as `/playground`'s, reading this playground's own posts — a
 * sub-view is rendered inside the record's own view, so
 * `useCurrentViewResourceContext` hands back the user being edited.
 */
export function UserActivity() {
  const user = useCurrentViewResourceContext()?.data as User | undefined
  const posts = readStudioRows<Post>(POSTS_ID).filter(
    (post) => post.author === user?.name
  )
  const published = posts.filter((post) => post.status === "published")
  const views = published.reduce((total, post) => total + (post.views ?? 0), 0)
  const last = published
    .map((post) => post.publishedAt)
    .sort()
    .at(-1)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Figure value={String(posts.length)} label="posts written" />
        <Figure value={String(published.length)} label="of them published" />
        <Figure value={views.toLocaleString("en-GB")} label="reads in all" />
      </div>

      <p className="text-sm text-muted-foreground">
        {last
          ? `Last published on ${last}.`
          : "Nothing published under this name yet."}
      </p>
    </div>
  )
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
