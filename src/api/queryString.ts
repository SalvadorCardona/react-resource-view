import { RecordOfAny } from "@/internal/type/RecordOfAny"

/**
 * A value the query string leaves out: an empty search box should widen the
 * list, not filter it down to rows whose field is the empty string.
 */
export function isEmptyFilterValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** Strips the empty values out of a filter, leaving what the API should see. */
export function withoutEmptyValues(filter: RecordOfAny = {}): RecordOfAny {
  const result: RecordOfAny = {}
  Object.entries(filter).forEach(([key, value]) => {
    if (isEmptyFilterValue(value)) return
    result[key] = value
  })
  return result
}

/**
 * Appends one value to a query string, in the PHP-style bracket notation both
 * API Platform and Strapi read: `tags[]=a`, `filters[title][$eq]=hello`.
 */
export function appendBracketParam(
  params: URLSearchParams,
  key: string,
  value: unknown
): void {
  if (isEmptyFilterValue(value)) return

  if (Array.isArray(value)) {
    value.forEach((entry) => appendBracketParam(params, `${key}[]`, entry))
    return
  }

  if (value instanceof Date) {
    params.append(key, value.toISOString())
    return
  }

  if (typeof value === "object") {
    Object.entries(value as RecordOfAny).forEach(([subKey, subValue]) =>
      appendBracketParam(params, `${key}[${subKey}]`, subValue)
    )
    return
  }

  params.append(key, String(value))
}

/** `?a=1&b=2`, or nothing at all when there is no parameter to carry. */
export function toQuerySuffix(params: URLSearchParams): string {
  const query = params.toString()
  return query ? `?${query}` : ""
}

/** Joins a base and a segment without doubling or dropping the slash. */
export function joinPath(base: string, segment: string): string {
  if (!base) return segment
  if (!segment) return base
  return `${base.replace(/\/+$/, "")}/${segment.replace(/^\/+/, "")}`
}

/** True of a URL the client should use as it stands. */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}
