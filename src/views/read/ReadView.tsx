import { Navigate } from "@/ports"
import EditView from "@/views/update/EditView"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { ActionList } from "react-data-form"
import { generateLinkByResource } from "@/routes/routes"

export const ReadView = () => {
  const currentResource = useCurrentViewResourceContext()
  const id = currentResource.id

  // A split list already shows the selected item's details, so a resource can
  // delegate its `read` to `list/{id}` through `layout.split({ readInList })`
  // rather than maintaining a separate read page.
  const delegatesReadToSplit = (
    currentResource.resource?.views?.[ActionList.list]?.layouts ?? []
  ).some((layout) => layout.type === "split" && layout.options.readInList)

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
