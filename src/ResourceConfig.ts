import { ViewResourceInterface } from "@/ViewResourceInterface"
import { FC, ReactNode } from "react"
import { ItemTable } from "@/views/list/component/table/ItemTable"
import { ListTable } from "@/views/list/component/table/ListTable"
import { RowTable } from "@/views/list/component/table/RowTable"

import { DefaultViewComponent } from "@/views/list/component/DefaultViewComponent"
import { ScopeConfig } from "@/scope/scopeInterface"

export interface ResourceConfigInterface {
  defaultResource?: Partial<ViewResourceInterface>
  decoratorComponent?: FC<{ children: ReactNode }>
  resources?: ViewResourceInterface[]
  scopes?: ScopeConfig
  defaultScope?: string
  onUnauthorized?: () => void
  scopeFallback?: ReactNode
}

let config: ResourceConfigInterface = {
  defaultResource: {
    view: {
      itemComponent: ItemTable,
      listComponent: ListTable,
      rowComponent: RowTable,
      viewComponent: DefaultViewComponent,
    },
    views: {
      read: {
        behavior: {
          openIn: "window",
        },
      },
      list: {},
      create: {
        behavior: {
          openIn: "window",
          closeAfterUpdate: false,
        },
      },
      update: {
        behavior: {
          openIn: "window",
        },
      },
      delete: {
        behavior: {
          openIn: "popup",
        },
      },
    },
  },
}

export function getResourceConfig(): ResourceConfigInterface {
  return config
}

export function setResourceConfig(newConfig: ResourceConfigInterface): void {
  config = { ...config, ...newConfig }
}
