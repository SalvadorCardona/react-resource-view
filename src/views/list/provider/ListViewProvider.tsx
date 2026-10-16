import { ListViewContext } from "@/views/list/provider/ListViewContext"
import { PropsWithChildren } from "react"
import useFilter from "@/views/list/filter/useFilter"
import useList from "@/views/list/hook/useList"
import { useListSelection } from "@/views/list/selection/useListSelection"

export default function ListViewProviderComponent({ children }: PropsWithChildren) {
  const filterContext = useFilter({})
  const listView = useList()
  const selection = useListSelection(listView.rows)

  return (
    <ListViewContext
      value={{
        filterContext,
        selection,
        ...listView,
      }}
    >
      {children}
    </ListViewContext>
  )
}
