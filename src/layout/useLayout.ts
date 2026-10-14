import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import type { ResolvedLayout } from "@/layout/layout"

/**
 * The list's layout on screen — its type, its id, and its own options with
 * their defaults:
 *
 * ```tsx
 * const { groupBy, columns } = useLayout<BoardLayoutOptions>().options
 * ```
 *
 * Outside a list, a layout of no type with no options.
 */
export function useLayout<Options extends object = Record<string, any>>(): ResolvedLayout<
  Partial<Options>
> {
  const { layout } = useCurrentViewResourceContext()

  return (layout ?? NO_LAYOUT) as ResolvedLayout<Partial<Options>>
}

const NO_LAYOUT: ResolvedLayout = {
  type: "",
  id: "",
  label: "",
  components: { list: () => null },
  options: {},
}
