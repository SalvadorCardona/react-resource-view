import { getResourceConfig } from "@/ResourceConfig"
import { ViewInterface } from "@/ViewInterface"
import { slugger } from "@/internal/string/slugger"
import createUniqId from "@/internal/id/createUniqId"

export function createView(params: Partial<ViewInterface>): ViewInterface {
  const id = params.id ?? slugger(params?.name ?? createUniqId())
  return {
    id,
    name: params.name,
    itemComponent: getResourceConfig().defaultResource?.view?.itemComponent,
    listComponent: getResourceConfig().defaultResource?.view?.listComponent,
    viewComponent: getResourceConfig().defaultResource?.view?.viewComponent,
    rowComponent: getResourceConfig().defaultResource?.view?.rowComponent,
    ...params,
  }
}
