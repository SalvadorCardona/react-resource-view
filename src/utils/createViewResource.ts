import {
  ResourceOptionInterface,
  ViewResourceInterface,
} from "@/ViewResourceInterface"
import { BaseJsonLdItemInterface, IdAbleInterface, JsonLdIri } from "jsonld-item"
import { ActionList } from "react-data-form"
import { getIdFromIri } from "jsonld-item"
import { ViewInterface } from "@/ViewInterface"
import { createView } from "@/utils/createView"
import { createPubSub } from "coooking-pubsub"
import { localStorageRepository } from "jsonld-repository"
import { createResource } from "resource-registry"
import { createRepository } from "@/api/createRepository"

export function createViewResource<
  Item extends BaseJsonLdItemInterface,
  Collection extends BaseJsonLdItemInterface = Item,
  Update extends object = Item,
>(
  id: JsonLdIri,
  resourceOption: ResourceOptionInterface<Item, Collection, Update>
): ViewResourceInterface<Item, Collection, Update> {
  if (resourceOption.resourceBuild === true) {
    return resourceOption as ViewResourceInterface<Item, Collection, Update>
  }

  const resource = {
    views: {},
    name: resourceOption.name ?? getIdFromIri(id),
    ...resourceOption,
    "@id": id,
  } as ViewResourceInterface<Item, Collection, Update>

  Object.values(ActionList).forEach((viewType) => {
    const currentView = {
      ...((resource.view ?? {}) as ViewInterface<BaseJsonLdItemInterface>),
      ...(resource?.views?.[viewType] ?? {}),
    }

    if (!currentView.name) {
      // A readable default title: "Users", "Create — Users"…
      const actionPrefix: Partial<Record<ActionList, string>> = {
        [ActionList.create]: "Create",
        [ActionList.update]: "Modifier",
        [ActionList.delete]: "Supprimer",
      }
      const prefix = actionPrefix[viewType]
      currentView.name = prefix ? `${prefix} — ${resource.name}` : `${resource.name}`
    }

    // @ts-expect-error is setted on the top
    resource.views[viewType] = createView(currentView)
  })

  resource.onChange = createPubSub()

  // The dialect is read here rather than per request: a resource declaring one
  // pins its backend, everything else follows `configureApi`.
  const repository = !resource.path
    ? localStorageRepository({ path: resource["@id"] })
    : createRepository({ path: resource.path, dialect: resource.dialect })

  resource["@type"] = "view-resource"
  resource.resourceBuild = true

  const lastResource = {
    ...resource,
    ...withResourceDecorators({ ...repository, ...resource }),
  }

  return createResource<ViewResourceInterface>(id, lastResource)
}

function withResourceDecorators({
  preCreate,
  preGetCollection,
  preUpdate,
  getItem,
  getCollection,
  removeItem,
  updateItem,
  createItem,
  onChange,
  preGetItem,
}: ViewResourceInterface): Partial<ViewResourceInterface> {
  return {
    getCollection: async (params, context) => {
      let payload = preGetCollection ? preGetCollection(params, context) : params
      if (context?.viewResourceContext?.filter) {
        payload = {
          ...payload,
          ...context.viewResourceContext.filter,
        }
      }

      const res = await getCollection(payload, context)

      return res
    },
    getItem: async (params: IdAbleInterface, context) => {
      const payload = preGetItem ? preGetItem(params, context) : params

      const res = await getItem(payload, context)

      return res
    },
    removeItem: async (params, context) => {
      const res = await removeItem(params, context)
      onChange.publish({ data: params, action: ActionList.delete })

      return res
    },
    updateItem: async (item, context) => {
      const payload = preUpdate ? preUpdate(item, context) : item
      const res = await updateItem(payload)
      onChange.publish({ data: res.data, action: ActionList.update })

      return res
    },
    createItem: async (params, context) => {
      const payload = preCreate ? preCreate(params, context) : params
      const res = await createItem(payload)
      onChange.publish({ data: res.data, action: ActionList.create })

      return res
    },
  } as Partial<ViewResourceInterface>
}
