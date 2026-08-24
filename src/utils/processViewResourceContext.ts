import { resolveViewResourceContext } from "@/utils/resolveViewResourceContext"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"

export async function processViewResourceContext(
  viewResourceContextParams: ViewResourceContextParams
) {
  const currentView = resolveViewResourceContext(viewResourceContextParams)

  if (currentView.resourceAction === ActionList.list) {
    const response = await currentView.resource?.getCollection(currentView.filter, {
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
