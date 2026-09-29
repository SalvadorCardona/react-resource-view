import type { FC } from "react"
import { useCurrentViewResourceContext } from "react-resource-view"
import {
  COMPANY_STATUSES,
  USERS_ID,
  readAdminRows,
  type Company,
  type User,
} from "@/demo/playground/adminData"

/**
 * The column beside a company's tabs: what the account amounts to at a glance,
 * kept in view whichever tab is open.
 *
 * It is `subViewResource.viewComponent`, so it is rendered inside the record's
 * own view, and `useCurrentViewResourceContext` hands back the company.
 */
export function CompanySummary() {
  const company = useCurrentViewResourceContext()?.data as Company | undefined
  if (!company) return null

  const team = readAdminRows<User>(USERS_ID).filter(
    (user) => user.company === company.name
  )
  const status =
    COMPANY_STATUSES.find((option) => option.value === company.status)?.label ??
    company.status

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="font-medium leading-snug">{company.name}</p>
        <p className="text-sm text-muted-foreground">{company.city}</p>
      </div>
      <dl className="space-y-2 text-sm">
        <Line label="Status" value={status} />
        <Line label="SIRET" value={company.siret} />
        <Line label="Account opened" value={company.signedAt} />
        <Line label="People" value={String(team.length)} />
      </dl>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * A tab the demo has no data for: what a real back office would keep about an
 * account, there to make the bar longer than the room beside the summary.
 */
export function companyNothingYet(what: string): FC {
  return function CompanyNothingYet() {
    const company = useCurrentViewResourceContext()?.data as Company | undefined

    return (
      <p className="text-sm text-muted-foreground">
        No {what} recorded for {company?.name ?? "this company"} yet.
      </p>
    )
  }
}
