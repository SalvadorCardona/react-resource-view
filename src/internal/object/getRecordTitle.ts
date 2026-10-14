import { RecordOfAny } from "@/internal/type/RecordOfAny"

/**
 * What a record is called, the way a reader would name it: the field the view
 * points at with `titleField`, failing that the usual suspects — `title`, `name`,
 * `label`. Returns nothing rather than an identifier, so the caller decides
 * what an unnamed record falls back to.
 */
export function getRecordTitle(
  data: RecordOfAny | undefined,
  titleField?: string
): string | undefined {
  if (!data) return undefined

  for (const key of [titleField, "title", "name", "label"]) {
    if (!key) continue
    const value = data[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return undefined
}
