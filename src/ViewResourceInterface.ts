import {
  ViewInterface,
  ViewListInterface,
  ViewUpdateInterface,
} from "@/ViewInterface"
import { AsyncRepositoryInterface } from "jsonld-repository"
import { BaseJsonLdItemInterface, IdAbleInterface } from "jsonld-item"
import { JsonLdCollection } from "jsonld-item"
import { FC, ReactNode } from "react"
import { ActionList } from "react-data-form"
import { Index } from "coooking-pubsub"
import { ViewResourceContext } from "@/ViewResourceContext"

export type PermissionType = (() => boolean) | boolean

interface ResourceContext {
  viewResourceContext?: ViewResourceContext
}

/**
 * Current state of a limit: how many items exist (`current`) and how many are
 * allowed at most (`max`).
 */
export interface LimitStateInterface {
  /** How many items already exist. */
  current: number
  /**
   * Maximum number of items allowed. `Infinity` means unlimited.
   */
  max: number
}

export interface LimitFallbackPropsInterface {
  /** State of the limit at the moment the fallback is rendered. */
  limit: LimitStateInterface
}

/**
 * Creation limit, configurable and independent of where the numbers come from.
 * `getLimit` may be synchronous — counting items already loaded in the context —
 * or asynchronous, such as a quota fetched from the API.
 */
export interface LimitInterface {
  /**
   * Computes the current state of the limit, both the count and the maximum.
   * It receives the resource context, so the count can be derived without
   * l'API. Peut retourner une valeur directe ou une promesse.
   */
  getLimit: (
    context: ViewResourceContext
  ) => LimitStateInterface | Promise<LimitStateInterface>
  /**
   * Rendered in place of the create button or form once the limit is reached
   * (`current >= max`). Without it, the create button is simply hidden.
   */
  fallback?: FC<LimitFallbackPropsInterface>
}

export interface ViewResourceInterface<
  Item extends IdAbleInterface = any,
  Collection extends IdAbleInterface = Item,
  Update extends Record<string, any> = Item,
>
  extends BaseJsonLdItemInterface, AsyncRepositoryInterface {
  canRead?: PermissionType
  canDelete?: PermissionType
  canList?: PermissionType
  canCreate?: PermissionType
  canUpdate?: PermissionType
  resourceBuild?: boolean
  decoratorComponent?: FC<{ children: ReactNode }>
  /**
   * Creation quota for this resource. Read by `ResourceViewButton` to hide the
   * create button, or render the fallback, once it is
   * atteinte. Voir {@link LimitInterface}.
   */
  limit?: LimitInterface
  views?: {
    read?: ViewInterface<Item>
    list?: ViewListInterface<Collection>
    create?: ViewUpdateInterface<Item, Update>
    update?: ViewUpdateInterface<Item, Update>
    delete?: ViewUpdateInterface<Item, Update>
  }
  view?: ViewListInterface<Item>
  path?: string
  name?: string
  preGetCollection?: (
    params?: Record<string, any>,
    context?: ResourceContext
  ) => Record<string, any>
  preUpdate?: (params?: Update, context?: ResourceContext) => Update
  preCreate?: (
    params?: Partial<Update>,
    context?: ResourceContext
  ) => Partial<Update>
  getCollection: (
    params?: Record<string, unknown>,
    context?: ResourceContext
  ) => Promise<{ data: JsonLdCollection<Collection> }>
  preGetItem?: (
    params: IdAbleInterface,
    context?: ResourceContext
  ) => IdAbleInterface
  getItem: (
    params: IdAbleInterface,
    context?: ResourceContext
  ) => Promise<{ data: Item }>
  removeItem: (
    params: IdAbleInterface,
    context?: ResourceContext
  ) => Promise<unknown>
  updateItem: (
    item: Partial<Update>,
    context?: ResourceContext
  ) => Promise<{ data: Item }>
  createItem: (
    item: Partial<Update>,
    context?: ResourceContext
  ) => Promise<{ data: Item }>
  scope?: string
  alias?: string
  onChange: Index<{ data: Item; action: ActionList }>
  icon?: FC<{ className?: string }>
}

export type ResourceOptionInterface<
  Item extends IdAbleInterface = any,
  Collection extends IdAbleInterface = Item,
  Update extends object = Item,
> = Partial<ViewResourceInterface<Item, Collection, Update>>
