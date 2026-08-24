import { createContext } from "react"
import { FilterOutputsInterface } from "@/views/list/filter/useFilter"
import { ListViewOutputsInterface } from "@/views/list/hook/useList"
import { BaseJsonLdItemInterface } from "jsonld-item"

export interface ListViewContextInterface extends ListViewOutputsInterface<BaseJsonLdItemInterface> {
  filterContext?: FilterOutputsInterface
}

export const ListViewContext = createContext<Partial<ListViewContextInterface>>({})
