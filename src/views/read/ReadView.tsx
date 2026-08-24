import { Navigate } from "@/ports"
import EditView from "@/views/update/EditView"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { ActionList } from "react-data-form"
import { generateLinkByResource } from "@/routes/routes"
import { SplitViewOptionInterface } from "@/views/list/component/split/columnViewOptionFactory"

export const ReadView = () => {
  const currentResource = useCurrentViewResourceContext()
  const id = currentResource.id

  // A split list already shows the selected item's details, so a resource can
  // delegate its `read` to `list/{id}` through `redirectReadToList` rather than
  // maintaining a separate read page.
  const delegatesReadToSplit = (
    currentResource.resource?.views?.[ActionList.list]?.viewVariants ?? []
  ).some((variant) => (variant as SplitViewOptionInterface).redirectReadToList)

  if (delegatesReadToSplit && id) {
    return (
      <Navigate
        replace
        to={generateLinkByResource({
          resource: currentResource.resource,
          resourceAction: ActionList.list,
          id: id as string,
        })}
      />
    )
  }

  return <EditView />
}
