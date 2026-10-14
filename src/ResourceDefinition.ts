import { FC, ReactNode } from "react"
import { ActionList, FormInputInterface, FormInterface } from "react-data-form"
import { IdAbleInterface, JsonLdCollection } from "jsonld-item"
import { ApiDialectInterface } from "@/api/apiDialectInterface"
import type { ViewResourceContext } from "@/ViewResourceContext"
import type { Layout } from "@/layout/layout"
import type { ViewResource, IconType } from "@/ViewResource"
import type { FilterInterface } from "@/views/list/filter/useFilter"

/**
 * What a resource declares — the object handed to `createViewResource`.
 *
 * Everything common to the five actions sits at the root; what belongs to one
 * action sits in `views.<action>`. The two are merged deeply, root first, so a
 * view only says what differs: `views.update.form.inputs.status` adjusts one
 * field and keeps the others.
 *
 * Read {@link ViewResource} for what the library builds out of it.
 */

/* -------------------------------------------------------------------------- */
/* Shared vocabulary                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One of the five things a resource can show. A plain string — `"update"` —
 * which is what the autocompletion offers; `ActionList.update` is the same
 * value and is still accepted.
 */
export type Action = "list" | "read" | "create" | "update" | "delete" | ActionList

/** What a permission is asked about: the five actions, and the CSV export. */
export type PermissionKey = `${ActionList}` | "export"

/**
 * The name of a field of `Item`, as the autocompletion offers it. A typo is a
 * TypeScript error. With `Item` left untyped, any string goes.
 */
export type FieldOf<Item> = Extract<keyof Item, string>

/* -------------------------------------------------------------------------- */
/* Permissions                                                                */
/* -------------------------------------------------------------------------- */

/** What a permission function is told. */
export interface PermissionContext<Item = any> {
  /** The action asked about. */
  action: PermissionKey
  /**
   * The record the action would apply to — the row of a list, the record of a
   * form. Absent for `list`, `create`, `export`, and for a button drawn
   * outside any record.
   */
  item?: Item
  /** The view context the question is asked from, when there is one. */
  context?: ViewResourceContext
}

/**
 * Whether an action is offered: a boolean, or a function of the record — which
 * may answer asynchronously.
 *
 * It decides what the interface offers, not what the API accepts: the API
 * stays the place where access is enforced.
 */
export type Permission<Item = any> =
  | boolean
  | ((context: PermissionContext<Item>) => boolean | Promise<boolean>)

/**
 * What a resource lets its users do. Everything is allowed by default — only
 * restrictions are declared.
 *
 * - `"all"` — every action, the export included (the default);
 * - `"readonly"` — `list`, `read` and `export`;
 * - a list of actions — those, and nothing else;
 * - an object — one permission per action; the actions it leaves out stay
 *   allowed.
 *
 * ```ts
 * permissions: { delete: ({ item }) => item?.status !== "done" }
 * ```
 */
export type Permissions<Item = any> =
  | "all"
  | "readonly"
  | PermissionKey[]
  | Partial<Record<PermissionKey, Permission<Item>>>

/* -------------------------------------------------------------------------- */
/* Data: repository, hooks, quota                                             */
/* -------------------------------------------------------------------------- */

/** What every repository call and every hook receives besides its payload. */
export interface ResourceContext {
  /** The view the call comes from, when it comes from one. */
  viewResourceContext?: ViewResourceContext
}

/** The five calls a resource makes to its data. */
export interface Repository<Item = any, Write extends object = Item & object> {
  getCollection: (
    params?: Record<string, any>,
    context?: ResourceContext
  ) => Promise<{ data: JsonLdCollection<Item> }>
  getItem: (params: IdAbleInterface, context?: ResourceContext) => Promise<{ data: Item }>
  createItem: (
    item: Partial<Write>,
    context?: ResourceContext
  ) => Promise<{ data: Item }>
  updateItem: (
    item: Partial<Write>,
    context?: ResourceContext
  ) => Promise<{ data: Item }>
  removeItem: (params: IdAbleInterface, context?: ResourceContext) => Promise<unknown>
}

type MaybePromise<T> = T | Promise<T>

/**
 * Code run around the calls to the data. Every hook gets the context of the
 * view it is called from, and may answer asynchronously.
 *
 * The `before*` hooks return what goes out — the query, the identifier, the
 * payload — so they can add to it or reshape it. The `after*` hooks are told
 * what came back.
 */
export interface ResourceHooks<Item = any, Write extends object = Item & object> {
  /** The query of a list: filters, page, page size. */
  beforeList?: (
    params: Record<string, any> | undefined,
    context: ResourceContext
  ) => MaybePromise<Record<string, any> | undefined>
  /** The identifier of the record about to be read. */
  beforeRead?: (
    params: IdAbleInterface,
    context: ResourceContext
  ) => MaybePromise<IdAbleInterface>
  /** The payload of a creation. */
  beforeCreate?: (
    data: Partial<Write>,
    context: ResourceContext
  ) => MaybePromise<Partial<Write>>
  /** The payload of an update. */
  beforeUpdate?: (
    data: Partial<Write>,
    context: ResourceContext
  ) => MaybePromise<Partial<Write>>
  /** The record about to be deleted. */
  beforeDelete?: (
    item: IdAbleInterface,
    context: ResourceContext
  ) => MaybePromise<IdAbleInterface>
  /** The record the API answered with, after a creation or an update. */
  afterSave?: (
    item: Item,
    context: ResourceContext & { action: "create" | "update" }
  ) => MaybePromise<void>
  /** The record that was deleted. */
  afterDelete?: (item: IdAbleInterface, context: ResourceContext) => MaybePromise<void>
}

/** How many records exist, and how many are allowed at most. */
export interface QuotaState {
  current: number
  /** `Infinity` means unlimited. */
  max: number
}

export interface QuotaFallbackProps {
  /** The state of the quota when the fallback is drawn. */
  quota: QuotaState
}

/**
 * How many records may be created. Not a pagination: the list shows every
 * page; the quota only hides the create button — or draws `fallback` in its
 * place — once `current >= max`.
 */
export interface Quota {
  /**
   * Counts. It receives the view context, so a count can be read off the rows
   * already loaded; it may as well ask the API.
   */
  get: (context: ViewResourceContext) => QuotaState | Promise<QuotaState>
  /** Drawn in place of the create button once the quota is reached. */
  fallback?: FC<QuotaFallbackProps>
}

/* -------------------------------------------------------------------------- */
/* Views                                                                      */
/* -------------------------------------------------------------------------- */

/** Where a view is drawn when its button is pressed. */
export type OpenMode = "page" | "dialog" | "drawer"

/**
 * What a form does once the record is saved.
 *
 * - `"close"` — leave the form: the dialog or the drawer closes; on a page,
 *   back to the list;
 * - `"stay"` — keep the form on screen; after a creation on a page it moves to
 *   the record just created;
 * - `"reload"` — stay, and fill the form again with what the API answered;
 * - `{ redirect }` — go where the function says, given the saved record.
 *
 * Defaults to `"close"` in a dialog or a drawer, `"stay"` on a page.
 */
export type AfterSave<Item = any> =
  | "close"
  | "stay"
  | "reload"
  | { redirect: (item: Item) => string }

/**
 * A form as `react-data-form` describes it, except that an input may be
 * `false`: a view removes a field it inherits with `inputs: { notes: false }`.
 */
export type FormDefinition<Data extends object = any> = Omit<
  FormInterface<Data>,
  "inputs"
> & {
  inputs?: { [Key in FieldOf<Data> | (string & {})]?: FormInputInterface | false }
}

/** The components a view is drawn with, by slot. */
export interface ComponentSlots {
  /** Replaces the whole view — the list, the form, the confirmation. */
  view?: FC
  /** Wraps the view — a layout of the application, a frame. */
  wrapper?: FC<{ children: ReactNode }>
  /** Replaces the whole header `AdminLayout` draws above the view. */
  navigation?: FC
  /** Replaces the title of that header, the back link and the breadcrumb kept. */
  title?: FC
  /** Replaces the actions on the right of that header. */
  actions?: FC
  /** Drawn above the view. */
  top?: FC
  /** Drawn below the view. */
  bottom?: FC
  /** Replaces the pagination of a list. */
  pagination?: FC
  /** Drawn when a list has nothing to show. */
  empty?: FC
}

/**
 * The components a view can be drawn with. Declared at the root, they reach
 * every action; in `views.<action>`, that action. Each level only replaces the
 * keys it names, and `null` removes one it inherits. How a list draws its rows
 * belongs to its layouts: `layout.cards({ components: { row: ProductRow } })`.
 */
export type ViewComponents = {
  [Slot in keyof ComponentSlots]?: ComponentSlots[Slot] | null
}

/** What every view of a resource accepts, at the root as well as per action. */
export interface CommonViewOptions<Item = any, Write extends object = Item & object> {
  /** Shared by the forms of every action, the table's columns and the cards. */
  form?: FormDefinition<Write>
  /**
   * Gives the view the page's whole width in `AdminLayout`. The most specific
   * declaration wins: layout, then action, then root.
   */
  fullWidth?: boolean
  /**
   * The field that names a record — `email` for an account known by its
   * address. Read by the header, the breadcrumb, the board's cards; without it
   * they try `title`, `name` and `label`.
   */
  titleField?: FieldOf<Item>
  /** Extra classes for the view's container. */
  className?: string
  components?: ViewComponents
  /** A sentence under the title of the list. */
  description?: string
}

/** What an action's view accepts besides the common options. */
export interface ActionViewOptions {
  /**
   * The title of the view. Derived from the resource's `name` — "Tasks",
   * "Create — Tasks", "Edit — Tasks" — so declare it only to say something
   * else.
   */
  title?: string
  /** The text of the button opening this action. Defaults to the action. */
  buttonLabel?: string
}

/** The view of a record's sub-views: tabs under its form or its page. */
export interface TabsDefinition<Item = any> {
  /**
   * `horizontal`, the default, is a bar above the tab; `vertical` a column
   * beside it — the shape a record with a dozen tabs wants. Below the `md`
   * breakpoint the column falls back to the bar.
   */
  orientation?: "horizontal" | "vertical"
  /** Drawn beside the tabs on a desktop, above them on a phone. */
  aside?: FC
  items: TabDefinition<Item>[]
}

/** What a tab built from the parent record receives. */
export interface TabContext<Item = any> {
  /** The record the tabs are drawn under. */
  item: Item
  /** The view context of that record. */
  parent: ViewResourceContext
}

/**
 * One tab: another resource, filtered on the record on screen — or a
 * component of one's own.
 */
export interface TabDefinition<Item = any> {
  /** In the URL. Defaults to the resource's identifier. */
  id?: string
  /** Defaults to the resource's `name`. */
  label?: string
  description?: string
  /** Defaults to the resource's `icon`. */
  icon?: IconType
  /** The resource the tab shows, or its identifier. */
  resource?: ViewResource | string
  /** Which of its views. Defaults to `"list"`. */
  action?: Action
  /** Narrows the tab to the record on screen: `({ item }) => ({ post: item["@id"] })`. */
  filter?: FilterInterface | ((context: TabContext<Item>) => FilterInterface)
  /**
   * What a record created from the tab starts with — so "new comment" means a
   * comment *of this post*.
   */
  defaultData?: object | ((context: TabContext<Item>) => object)
  /** A component of one's own, in place of a resource. */
  component?: FC
}

/** `views.list` */
export interface ListViewDefinition<Item = any, Write extends object = Item & object>
  extends CommonViewOptions<Item, Write>, ActionViewOptions {
  /**
   * The layouts the list can be shown in — `layout.table()`, `layout.board()`…
   * — the first one being the one it opens on. Defaults to a table.
   */
  layouts?: Layout<Item>[]
  /** The filter bar above the list, and the filters applied before any is chosen. */
  filters?: FormDefinition<any> & {
    /**
     * Filters applied as long as the URL carries none: they go out with the
     * first request and pre-fill the filter bar.
     */
    initial?: FilterInterface
  }
  /** How many records a page holds. Sent to the API, whatever its dialect. */
  pageSize?: number
  /**
   * The buttons at the end of each row, in order. Defaults to
   * `["update", "delete"]`; permissions still apply on top.
   */
  rowActions?: Extract<Action, "read" | "update" | "delete" | ActionList>[]
}

interface OpenableViewDefinition {
  /**
   * Where the view is drawn when its button is pressed: the whole `page`, a
   * `dialog` over it, or a `drawer` sliding in — from the right on a desktop,
   * from the bottom on a phone. A direct link always opens the page.
   */
  open?: OpenMode
}

/** `views.read` */
export interface ReadViewDefinition<Item = any, Write extends object = Item & object>
  extends CommonViewOptions<Item, Write>, ActionViewOptions, OpenableViewDefinition {
  tabs?: TabsDefinition<Item>
}

/** `views.create` */
export interface CreateViewDefinition<Item = any, Write extends object = Item & object>
  extends CommonViewOptions<Item, Write>, ActionViewOptions, OpenableViewDefinition {
  afterSave?: AfterSave<Item>
}

/** `views.update` */
export interface UpdateViewDefinition<Item = any, Write extends object = Item & object>
  extends CreateViewDefinition<Item, Write> {
  tabs?: TabsDefinition<Item>
}

/** `views.delete` */
export interface DeleteViewDefinition<Item = any, Write extends object = Item & object>
  extends CommonViewOptions<Item, Write>, ActionViewOptions, OpenableViewDefinition {}

export interface ViewsDefinition<Item = any, Write extends object = Item & object> {
  list?: ListViewDefinition<Item, Write>
  read?: ReadViewDefinition<Item, Write>
  create?: CreateViewDefinition<Item, Write>
  update?: UpdateViewDefinition<Item, Write>
  delete?: DeleteViewDefinition<Item, Write>
}

/* -------------------------------------------------------------------------- */
/* The declaration                                                            */
/* -------------------------------------------------------------------------- */

export interface ResourceDefinition<Item = any, Write extends object = Item & object>
  extends CommonViewOptions<Item, Write> {
  /** What the resource is called — the menu, the titles, the breadcrumb. */
  name?: string
  icon?: IconType
  /** Another identifier the resource answers to in a URL. */
  alias?: string

  /** The API path of the collection: `"/api/tasks"`. */
  path?: string
  /**
   * Keeps the records in the browser's `localStorage` instead of an API — a
   * demo, a prototype. Declared, because a forgotten `path` must not look like
   * a working API.
   */
  storage?: "local"
  /**
   * How this resource's API spells its URLs, pages, filters and errors.
   * Defaults to the dialect given to `configureApi`.
   */
  dialect?: ApiDialectInterface
  /** Replaces some or all of the calls to the data. */
  repository?: Partial<Repository<Item, Write>>
  /** Code run around the calls to the data. */
  hooks?: ResourceHooks<Item, Write>
  /**
   * Reloads the views when the API pushes a change (Mercure, for the JSON-LD
   * dialect).
   */
  realtime?: boolean

  /** What the users may do. Everything, unless restricted here. */
  permissions?: Permissions<Item>
  /** How many records may be created. */
  quota?: Quota

  /** What is particular to one action. */
  views?: ViewsDefinition<Item, Write>
}

/**
 * The defaults given to `configureResourceView`: the shape of a declaration,
 * merged beneath every resource.
 */
export type ResourceDefaults = Omit<
  ResourceDefinition,
  "name" | "icon" | "alias" | "path" | "repository"
>
