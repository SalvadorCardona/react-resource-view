import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"

export async function processViewResourceContext(
  viewResourceContextParams: ViewResourceContextParams
) {
  const currentView = resolveViewResourceContext(viewResourceContextParams)

  if (currentView.resourceAction === ActionList.list) {
    // The page size travels with the request rather than staying a display
    // setting: Strapi and Supabase page by an explicit size, and a list whose
    // pagination counts by 30 while the API answers 10 at a time is wrong on
    // both counts. An explicit filter still wins.
    const filter =
      currentView.view?.itemsPerPage !== undefined
        ? { itemsPerPage: currentView.view.itemsPerPage, ...currentView.filter }
        : currentView.filter

    const response = await currentView.resource?.getCollection(filter, {
      viewResourceContext: currentView,
    })
    currentView.data = response?.data ?? currentView.data
    return { ...currentView }
  }

  // A creation has no existing item to load
  if (currentView.resourceAction === ActionList.create && !currentView.id) {
    return { ...currentView }
  }

  const response = await currentView.resource?.getItem(
    { id: currentView.id },
    {
      viewResourceContext: currentView,
    }
  )
  currentView.data = response?.data ?? currentView.data

  return { ...currentView }
}
