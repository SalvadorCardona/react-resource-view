import { useMemo, useSyncExternalStore } from "react"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { toast } from "sonner"
import { BaseJsonLdItemInterface, IdAbleInterface } from "jsonld-item"
import { JsonLdCollection } from "jsonld-item"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { RowInterface } from "@/ViewResource"
import { translate } from "react-mini-i18n"
import { getCollectionItems } from "@/api/collection"
import { normalizeApiError } from "@/api/apiRequestError"
import { resolveDialect } from "@/api/apiConfig"
import { applyOptimisticWrites, getOptimisticStore } from "@/api/optimistic"
import { removeRecord, updateRecord } from "@/hook/useResourceMutation"

export interface ListViewOutputsInterface<T> {
  originalData?: JsonLdCollection<T> | null
  data?: T[]
  /**
   * Identity is whatever the resource's dialect reads — an `@id`, an `id`, a
   * `documentId` — so these take a record that merely has one, rather than a
   * record shaped like JSON-LD.
   */
  removeData?: (data: IdAbleInterface) => void
  updateData?: (data: IdAbleInterface, persist?: boolean) => void
  /**
   * The rows read from the API, with the writes still in flight laid over
   * them: what the API is expected to answer, before it does.
   */
  rows: RowInterface[]
}

export default function useList(): ListViewOutputsInterface<BaseJsonLdItemInterface> {
  const currentResource = useCurrentViewResourceContext()
  const resource = currentResource.resource
  const originalData = currentResource.data as JsonLdCollection
  const store = getOptimisticStore(resource)
  const writes = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  )
  const context = { viewResourceContext: currentResource.viewResource }

  const updateData = (newData: IdAbleInterface, persist: boolean = true) => {
    const identifier = getIdFromObject(newData, true, resource)

    if (!identifier) {
      throw new Error("Id not found in objet")
    }

    if (!persist) return

    updateRecord(resource, { id: identifier, ...newData }, { context })
      .then(() => {
        currentResource.fetchData()
        toast(translate("Saved"))
      })
      .catch((e) => {
        console.error(e)
        toast(translate("An error occurred"))
      })
  }

  const removeData = (data: IdAbleInterface) => {
    removeRecord(resource, data, { context })
      .then(() => {
        currentResource.fetchData()
        toast(translate("Deleted"))
      })
      .catch((e) => {
        const apiError = normalizeApiError(e, resolveDialect(resource))
        const violations = apiError?.violations ?? []

        toast(translate("Deletion is not possible"), {
          description: violations.length
            ? violations.map((violation) => violation.message).join(", ")
            : (apiError?.detail ?? undefined),
        })
      })
  }

  const rows = useMemo(
    () =>
      applyOptimisticWrites(
        getCollectionItems<BaseJsonLdItemInterface>(originalData, resource),
        writes,
        resource
      ),
    [originalData, writes, resource]
  )
  const data = useMemo(
    () => rows.map((row) => row.data as BaseJsonLdItemInterface),
    [rows]
  )

  return {
    data,
    updateData,
    originalData,
    removeData,
    rows,
  }
}
