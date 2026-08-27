import { useEffect, useState } from "react"
import {
  LimitInterface,
  LimitStateInterface,
} from "@/ViewResourceInterface"
import { ViewResourceContext } from "@/ViewResourceContext"

export interface UseLimitResult {
  /** The limit state, or `undefined` while it is still being resolved. */
  limit?: LimitStateInterface
  /** True while an asynchronous limit is still resolving. */
  isLoading: boolean
  /** `true` once the limit is reached (`current >= max`). */
  isReached: boolean
}

/**
 * Resolves a {@link LimitInterface} for a given resource context.
 *
 * Handles synchronous and asynchronous `getLimit` alike — a local count or a
 * quota fetched from the API: the promise is unwrapped in an effect and the
 * last result is kept in state.
 */
export function useLimit(
  limitConfig: LimitInterface | undefined,
  context: ViewResourceContext
): UseLimitResult {
  const [limit, setLimit] = useState<LimitStateInterface | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(!!limitConfig)

  useEffect(() => {
    if (!limitConfig) {
      setLimit(undefined)
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)

    Promise.resolve(limitConfig.getLimit(context))
      .then((result) => {
        if (active) setLimit(result)
      })
      .catch((error) => {
        if (active) {
          console.warn("useLimit: getLimit failed", error)
          setLimit(undefined)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [limitConfig, context])

  const isReached = !!limit && limit.current >= limit.max

  return { limit, isLoading, isReached }
}
