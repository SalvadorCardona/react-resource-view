import { ListViewContext } from "@/views/list/provider/ListViewContext"
import { PropsWithChildren } from "react"
import useFilter from "@/views/list/filter/useFilter"
import useList from "@/views/list/hook/useList"

export default function ListViewProviderComponent({ children }: PropsWithChildren) {
  const filterContext = useFilter({})
  const listView = useList()

  return (
    <ListViewContext
      value={{
        filterContext,
        ...listView,
      }}
    >
      {children}
    </ListViewContext>
  )
}
