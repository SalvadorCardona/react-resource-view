/**
 * Upper-cases the first letter only, "vue d'ensemble" → "Vue d'ensemble".
 * Done on the string rather than with CSS `::first-letter`, which skips
 * inline elements and leaves the label unchanged for any other consumer
 * (tests, title attributes, assistive technologies).
 */
export default function capitalizeFirst(label: string): string {
  const [first, ...rest] = label
  return first === undefined ? label : first.toLocaleUpperCase() + rest.join("")
}
