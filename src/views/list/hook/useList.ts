import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { toast } from "sonner"
import { BaseJsonLdItemInterface, IdAbleInterface } from "jsonld-item"
import { JsonLdCollection } from "jsonld-item"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { RowInterface } from "@/ViewInterface"
import { translate } from "react-mini-i18n"
import { getCollectionItems } from "@/api/collection"
import { normalizeApiError } from "@/api/apiRequestError"
import { resolveDialect } from "@/api/apiConfig"

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
  rows: RowInterface[]
}

export default function useList(): ListViewOutputsInterface<BaseJsonLdItemInterface> {
  const currentResource = useCurrentViewResourceContext()
  const resource = currentResource.resource
  const originalData = currentResource.data as JsonLdCollection

  const updateData = (newData: IdAbleInterface, persist: boolean = true) => {
    const identifier = getIdFromObject(newData, true, resource)

    if (!identifier) {
      throw new Error("Id not found in objet")
    }

    if (!persist) return

    resource
      .updateItem({
        id: identifier,
        ...newData,
      })
      .then(() => {
        currentResource.fetchData()
        toast(translate("Saved"))
      })
      .catch((e) => {
        console.error(e)
        toast("Une erreur est survenue")
      })
  }

  const removeData = (data: IdAbleInterface) => {
    resource
      .removeItem(data)
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

  const data = getCollectionItems<BaseJsonLdItemInterface>(originalData, resource)

  const rows: RowInterface[] = data.map((e) => {
    return {
      data: e,
    }
  })

  return {
    data,
    updateData,
    originalData,
    removeData,
    rows,
  }
}
