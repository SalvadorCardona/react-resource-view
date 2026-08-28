type ClassValue = string | number | null | false | undefined | ClassValue[]

/**
 * Joins class names. Deliberately not `tailwind-merge`: nothing on this site
 * builds a class list that needs conflict resolution, and the libraries carry
 * their own copy for their own components.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value && value !== 0) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }

  return out.join(" ")
}
