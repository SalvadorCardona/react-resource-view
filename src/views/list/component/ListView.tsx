import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import ChangeViewVariant from "@/views/list/component/ChangeViewOptionComponent"
import ListViewProviderComponent from "@/views/list/provider/ListViewProvider"
import { PageLoader } from "@/ui/Loader"
import { Trans } from "react-mini-i18n"
import { FormElement } from "react-data-form"
import { NoResult } from "@/views/list/component/NoResult"
import { Button } from "@/ui/button"
import { CircleX } from "lucide-react"
import { ViewResourceInterface } from "@/ViewResourceInterface"
import { FormInterface } from "react-data-form"
import { ListComponentPropsInterface } from "@/ViewInterface"
import { DefaultRowComponent } from "@/views/list/component/DefaultRowComponent"
import { ActionList } from "react-data-form"
import ResourceViewButton from "@/action/ResourceViewButton"
import { ExportButton } from "@/views/list/component/ExportButton"
import {
  ListFilterBar,
  listFilterFormClassName,
} from "@/views/list/component/ListFilterBar"

function getFormFilter(resource: ViewResourceInterface): FormInterface | undefined {
  return resource?.views?.list?.formFilter ?? undefined
}

export default function ListView() {
  return (
    <ListViewProviderComponent>
      <ContentList />
    </ListViewProviderComponent>
  )
}

export const ContentList = () => {
  return (
    <div className={"g:p-0 lg:min-w-75 gap-2 flex flex-col"}>
      <div className={"flex flex-wrap items-center gap-2"}>
        <ResourceViewButton action={ActionList.create} />
        <ExportButton />
      </div>
      <ChangeViewVariant />
      <FormFilter />
      <List />
      <NoResult />
    </div>
  )
}

const List = () => {
  const currentResource = useCurrentViewResourceContext()
  const view = currentResource.view
  const viewOptionName = currentResource.viewVariant
  const listView = useListViewContext()

  if (currentResource.isLoading && listView.data.length === 0) return <PageLoader />
  if (currentResource.error) return <Trans>Une erreur est survenue</Trans>

  if (listView.data.length === 0) {
    return <></>
  }

  return (
    <ListComponent rows={listView.rows} key={"view-" + view.id + viewOptionName} />
  )
}

function FormFilter() {
  const listViewContext = useListViewContext()
  const { filterContext } = listViewContext
  const formContext = listViewContext.filterContext.formContext
  const currentResource = useCurrentViewResourceContext()
  const filter = getFormFilter(currentResource.resource)

  if (!filter) {
    return null
  }

  return (
    <>
      {filterContext.filter && (
        <div className={"lg:min-w-75 max-w-full"}>
          {!filterContext.filterIsEmpty && filterContext.filter && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => filterContext.resetFilter({})}
            >
              <CircleX />
              <Trans>Clear the search</Trans>
            </Button>
          )}
          <ListFilterBar>
            <FormElement className={listFilterFormClassName} {...formContext} />
          </ListFilterBar>
        </div>
      )}
    </>
  )
}

function ListComponent({ rows = [] }: ListComponentPropsInterface) {
  const view = useCurrentViewResourceContext().view

  const currentResource = useCurrentViewResourceContext()

  if (!view.rowComponent) {
    return <>List component is undefined</>
  }

  const ListComponent = currentResource.view.listComponent
  if (ListComponent) {
    return <ListComponent rows={rows} />
  }

  return (
    <>
      {rows.map((row, e) => {
        return (
          <div key={"row-" + e}>
            <DefaultRowComponent row={row} />
          </div>
        )
      })}
    </>
  )
}
