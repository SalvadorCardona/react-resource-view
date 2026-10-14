import { FC, ReactNode } from "react"
import { MenuItemInterface } from "@/menu/menu"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import type { ViewResource } from "@/ViewResource"


export class UnauthorizedError extends Error {
  readonly status = 401
  constructor(message = "Not Logged") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  readonly status = 403
  constructor(message = "Not Authorized") {
    super(message)
    this.name = "ForbiddenError"
  }
}

/** An entry of a scope's menu: a link, a group of links — or a resource. */
export type ScopeMenuEntry =
  | ViewResource
  | (Omit<MenuItemInterface, "items"> & { items?: ScopeMenuEntry[] })

export interface ScopeInterface {
  name: string
  /**
   * The resources of this area. The one place a resource's scope is
   * declared: when the scope loads, each resource listed here links within it.
   */
  resources?: ViewResource[]
  decoratorComponent?: FC<{ children: ReactNode }>
  /**
   * The navigation of the area. `"auto"` lists `resources`, in order; a list
   * mixes resources — an entry each, named and iconed after them — with links
   * and groups of one's own.
   */
  menu?: "auto" | ScopeMenuEntry[]
  home?: string
  middleWare?: () => void
  label?: string
  defaultViewResourceContextParams?: ViewResourceContextParams
  /**
   * Whether the user may enter the area, synchronously or not. Returning
   * `false` is a 403. Any error carrying `status: 401` or `status: 403` is
   * recognised; the classes above are only a convenience.
   * @throws {UnauthorizedError} 401 - Not signed in
   * @throws {ForbiddenError} 403 - Not allowed
   */
  authorization?: () => boolean | Promise<boolean>
  /** Drawn in place of the area until `authorization` has answered. */
  authorizationFallback?: ReactNode
  /**
   * Drawn in place of the area when `authorization` refuses it (403), and in
   * place of a view whose action the resource refuses.
   */
  forbiddenFallback?: ReactNode
}

/** A scope once loaded: its menu made of links only. */
export interface ResolvedScope extends Omit<ScopeInterface, "menu"> {
  menu?: MenuItemInterface[]
}

export type ScopeConfig = Record<string, () => Promise<ScopeInterface>>
