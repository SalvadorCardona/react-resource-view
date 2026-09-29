import type { ReactNode } from "react"
import { CalendarClock, Eye, FileUser, ScrollText } from "lucide-react"
import { useCurrentViewResourceContext } from "react-resource-view"
import {
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_HEADER,
  RESUME_SKILLS,
} from "@/demo/builder/blocks"
import { formatDay } from "@/demo/playground/adminRows"
import {
  POSTS_ID,
  readAdminRows,
  type Post,
  type User,
} from "@/demo/playground/adminData"

/** The four kinds of section a CV is made of, in the order it prints them. */
const RESUME_SECTIONS = [
  { type: RESUME_HEADER, label: "Identity" },
  { type: RESUME_EXPERIENCE, label: "Experience" },
  { type: RESUME_EDUCATION, label: "Education" },
  { type: RESUME_SKILLS, label: "Skills" },
]

/**
 * The column beside an account's tabs: what the account adds up to, at a
 * glance, whichever tab is open.
 *
 * It is `subViewResource.viewComponent`, rendered inside the record's view
 * like the tabs are — so `useCurrentViewResourceContext` hands back the account
 * on screen, and the figures are read from the same storage the posts list and
 * the CV tab write to. A save in either redraws them.
 */
export function UserSummary() {
  const user = useCurrentViewResourceContext()?.data as User | undefined
  const posts = readAdminRows<Post>(POSTS_ID).filter(
    (post) => post.author === user?.name
  )
  const published = posts.filter((post) => post.status === "published")
  const reads = published.reduce((total, post) => total + (post.views ?? 0), 0)
  const lastPublished = published
    .map((post) => post.publishedAt)
    .sort()
    .at(-1)

  const blockTypes = new Set((user?.blocks ?? []).map((block) => block.type))
  const missing = RESUME_SECTIONS.filter((section) => !blockTypes.has(section.type))
  const filled = RESUME_SECTIONS.length - missing.length
  const completeness = Math.round((filled / RESUME_SECTIONS.length) * 100)

  return (
    <section
      aria-labelledby="user-summary"
      className="rounded-2xl border border-border bg-card p-5 text-card-foreground"
    >
      <h3 id="user-summary" className="text-sm font-medium text-muted-foreground">
        At a glance
      </h3>

      {/* Two by two on a phone, where the column sits above the tabs and
          would otherwise push them a screen down; one under the other beside
          them. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-1">
        <Figure
          icon={<ScrollText />}
          label="Posts"
          value={String(posts.length)}
          hint={`${published.length} published`}
        />
        <Figure
          icon={<Eye />}
          label="Reads"
          value={reads.toLocaleString("en-GB")}
          hint="across published posts"
        />
        <Figure
          icon={<CalendarClock />}
          label="Last published"
          value={lastPublished ? formatDay(lastPublished) : "—"}
          hint={lastPublished ? undefined : "nothing out yet"}
          className="col-span-2 md:col-span-1"
        />
      </dl>

      <div className="mt-5 border-t border-border pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-medium [&>svg]:size-4 [&>svg]:text-muted-foreground">
            <FileUser />
            Curriculum vitæ
          </p>
          <p className="text-sm font-semibold tabular-nums">{completeness}%</p>
        </div>
        <div
          role="progressbar"
          aria-label="Curriculum vitæ completeness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completeness}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-view transition-[width]"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {missing.length === 0
            ? "Every section is filled in."
            : `${filled} of ${RESUME_SECTIONS.length} sections — missing ${missing
                .map((section) => section.label.toLowerCase())
                .join(", ")}.`}
        </p>
      </div>
    </section>
  )
}

function Figure({
  icon,
  label,
  value,
  hint,
  className,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&>svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  )
}
