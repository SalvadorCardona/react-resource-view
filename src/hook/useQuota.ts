import { useEffect, useState } from "react"
import type { Quota, QuotaState } from "@/ResourceDefinition"
import { ViewResourceContext } from "@/ViewResourceContext"

export interface UseQuotaResult {
  /** The quota's state, or `undefined` while it is still being counted. */
  quota?: QuotaState
  /** True while an asynchronous count is still answering. */
  isLoading: boolean
  /** `true` once the quota is reached (`current >= max`). */
  isReached: boolean
}

/**
 * Resolves a {@link Quota} for a view context.
 *
 * Handles a synchronous `get` and an asynchronous one alike — a count of the
 * rows already loaded, or an allowance asked from the API: the promise is
 * unwrapped in an effect and the last answer is kept.
 */
export function useQuota(
  quotaConfig: Quota | undefined,
  context: ViewResourceContext
): UseQuotaResult {
  const [quota, setQuota] = useState<QuotaState | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(!!quotaConfig)

  useEffect(() => {
    if (!quotaConfig) {
      setQuota(undefined)
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)

    Promise.resolve(quotaConfig.get(context))
      .then((result) => {
        if (active) setQuota(result)
      })
      .catch((error) => {
        if (active) {
          console.warn("useQuota: get failed", error)
          setQuota(undefined)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [quotaConfig, context])

  const isReached = !!quota && quota.current >= quota.max

  return { quota, isLoading, isReached }
}
