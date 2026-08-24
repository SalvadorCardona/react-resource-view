import { useContext } from "react"
import {
  ListViewContext,
  ListViewContextInterface,
} from "@/views/list/provider/ListViewContext"

export function useListViewContext() {
  return useContext(ListViewContext) as Required<ListViewContextInterface>
}
