import { ApiJsonLdError } from "jsonld-api-client"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { toast } from "sonner"
import { BaseJsonLdItemInterface } from "jsonld-item"
import { getItems, JsonLdCollection } from "jsonld-item"
import getIdFromObject from "@/internal/id/getIdFromObject"
import { getIdFromIri } from "jsonld-item"
import { RowInterface } from "@/ViewInterface"
import { translate } from "react-mini-i18n"

export interface ListViewOutputsInterface<T> {
  originalData?: JsonLdCollection<T> | null
  data?: T[]
  removeData?: (data: BaseJsonLdItemInterface) => void
  updateData?: (data: BaseJsonLdItemInterface, persist?: boolean) => void
  rows: RowInterface[]
}

export default function useList(): ListViewOutputsInterface<BaseJsonLdItemInterface> {
  const currentResource = useCurrentViewResourceContext()
  const resource = currentResource.resource
  const originalData = currentResource.data as JsonLdCollection

  const updateData = (newData: BaseJsonLdItemInterface, persist: boolean = true) => {
    const identifier = getIdFromObject(newData)

    if (!identifier) {
      throw new Error("Id not found in objet")
    }

    if (!persist) return

    resource
      .updateItem({
        id: getIdFromIri(identifier),
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

  const removeData = (data: BaseJsonLdItemInterface) => {
    resource
      .removeItem(data)
      .then(() => {
        currentResource.fetchData()
        toast(translate("Deleted"))
      })
      .catch((e) => {
        const data: ApiJsonLdError = e.data
        if (!data?.violations) {
          toast("Suppression impossible", {
            description: e.data,
          })
          return
        }

        toast("Suppression impossible", {
          description: data.violations?.map((e) => e.message).join(", ") as string,
        })
      })
  }

  const data = getItems(originalData)

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
