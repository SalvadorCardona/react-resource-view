import { FC, ReactNode } from "react"
import { FormInputInterface, FormInterface } from "react-data-form"
import { BaseJsonLdItemInterface } from "jsonld-item"
import { Index } from "coooking-pubsub"
import { ActionList } from "react-data-form"
import { ApiDialectInterface } from "@/api/apiDialectInterface"
import type { LayoutComponents, ResolvedLayout } from "@/layout/layout"
import type {
  AfterSave,
  OpenMode,
  Permission,
  PermissionKey,
  Quota,
  Repository,
  ResourceDefinition,
  ResourceHooks,
  TabDefinition,
  ComponentSlots,
  ListViewDefinition,
} from "@/ResourceDefinition"

/**
 * What `createViewResource` builds out of a {@link ResourceDefinition}: the
 * declaration with every default applied, one resolved view per action, and
 * the calls to the data. This is what the components read; it is not written
 * by hand.
 */

export type IconType = FC<{ className?: string }>

export interface RowInterface<Data extends object = any> {
  data: Data
}

/** An action run on every selected card of a board at once. */
export interface BulkActionInterface<Data extends object = any> {
  label: string
  icon?: IconType
  /**
   * Receives the selected records, and may return a promise. The board
   * refreshes once it has settled, and the selection is cleared if it resolves.
   */
  onAction: (records: Data[]) => unknown
}

export interface ListComponentPropsInterface<Data extends object = any> {
  rows: RowInterface<Data>[]
  children?: ReactNode
}

export interface RowComponentPropsInterface<T extends object = any> {
  row?: RowInterface<T>
  children?: ReactNode
}

export interface ItemComponentPropsInterface {
  formInput?: FormInputInterface
  children?: ReactNode
}

/**
 * The components of a view once every level is merged — and, in the context
 * of a list, those of the layout on screen.
 */
export interface ResolvedComponents extends ComponentSlots, Partial<LayoutComponents> {
  view: FC
}

/** The tabs of a view, ready to draw. */
export interface ResolvedTabs {
  orientation: "horizontal" | "vertical"
  aside?: FC
  items: TabDefinition[]
}

/**
 * One action's view: the root of the declaration, the action's own options
 * and the library's defaults, merged. In a view context, the layout on screen
 * is merged into it too — its form, its components, its width.
 */
export interface ResolvedView {
  action: `${ActionList}`
  /** The action's name — the view's identifier. */
  id: string
  title: string
  description?: string
  buttonLabel?: string
  fullWidth: boolean
  className?: string
  titleField?: string
  open: OpenMode
  afterSave?: AfterSave
  /** `false` inputs removed, ready for `react-data-form`. */
  form?: FormInterface
  components: ResolvedComponents
  /** The list's layouts; empty for any other action. */
  layouts: ResolvedLayout[]
  filters?: ListViewDefinition["filters"]
  pageSize?: number
  rowActions: `${ActionList}`[]
  tabs?: ResolvedTabs
}

export interface ViewResource<Item = any, Write extends object = Item & object>
  extends BaseJsonLdItemInterface,
    Repository<Item, Write> {
  "@type": "view-resource"
  name: string
  icon?: IconType
  alias?: string
  path?: string
  storage?: "local"
  dialect?: ApiDialectInterface
  realtime: boolean
  /**
   * The scope whose `resources` list this resource — the area its links lead
   * to. Set when that scope loads.
   */
  scope?: string
  /** One permission per action, every default applied. */
  permissions: Record<PermissionKey, Permission<Item>>
  quota?: Quota
  hooks: ResourceHooks<Item, Write>
  views: Record<`${ActionList}`, ResolvedView>
  /** Published after every creation, update and deletion. */
  onChange: Index<{ data: Item; action: ActionList }>
  /** The declaration, as written. */
  definition: ResourceDefinition<Item, Write>
}
