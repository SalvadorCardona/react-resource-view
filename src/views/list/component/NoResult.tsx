import { Search } from "lucide-react"
import { Card, CardContent } from "@/ui/card"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { ViewListInterface } from "@/ViewInterface"
import { FC } from "react"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ResourceViewButton from "@/action/ResourceViewButton"
import { ActionList } from "react-data-form"
import { getCollectionItems, getCollectionTotal } from "@/api/collection"

export function NoResult() {
  const listViewContext = useListViewContext()
  const currentResource = useCurrentViewResourceContext()
  const currentView: ViewListInterface = currentResource.view
  const collection = listViewContext?.originalData
  const resource = currentResource.resource

  if (!collection) {
    return null
  }

  // An API that reports no total still answers with its rows, and an empty
  // page is an empty result — otherwise Supabase, which counts only when
  // asked, would never say so.
  const totalItems =
    getCollectionTotal(collection, resource) ??
    getCollectionItems(collection, resource).length

  if (totalItems > 0) {
    return null
  }

  if (currentView && currentView.components?.noResult) {
    return <currentView.components.noResult />
  }

  return <NoResultComponent />
}

interface NoResultPropsInterface {
  title?: string
  body?: FC
  icon?: FC<{ className?: string }>
}

export function NoResultComponent({ title, body, icon }: NoResultPropsInterface) {
  const CurrentBody = body
    ? body
    : () => {
        return (
          <span>
            Nothing matched your search. Try different criteria, or come back later.
          </span>
        )
      }

  const Icon = icon ?? Search

  return (
    <div className="flex items-center justify-center min-h-100 p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-2">
            {title ?? "No results yet"}
          </h3>

          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            <CurrentBody />
          </p>

          <div className="flex gap-2">
            <ResourceViewButton action={ActionList.create} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
