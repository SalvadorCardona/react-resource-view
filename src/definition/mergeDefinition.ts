/**
 * Merges declarations the way a resource is read: each level only replaces
 * what it names.
 *
 * Plain objects — `views.update`, `components`, `form.inputs`, an input — are
 * merged key by key, at any depth. Everything else replaces what was there:
 * an array (`layouts`, `rowActions`), a function, a component. A key set to
 * `undefined` is ignored, so a spread of optional values never erases a
 * default; `null` and `false` are kept, which is how a level removes what it
 * inherits (`inputs: { notes: false }`, `components: { top: null }`).
 */
export function mergeDefinition<T extends object>(
  ...levels: (Partial<T> | undefined | null)[]
): T {
  const result: Record<string, unknown> = {}

  for (const level of levels) {
    if (!level) continue

    for (const [key, value] of Object.entries(level)) {
      if (value === undefined) continue
      const current = result[key]

      result[key] =
        isPlainObject(current) && isPlainObject(value)
          ? mergeDefinition(current, value)
          : isPlainObject(value)
            ? mergeDefinition(value)
            : value
    }
  }

  return result as T
}

/**
 * An object literal, as opposed to an array, a component, a class instance —
 * or a React element, which is an object literal too but must reach React as
 * it was created.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false
  if ("$$typeof" in value) return false
  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}
