import { beforeEach, describe, expect, it, vi } from "vitest"
import { createViewResource } from "./createViewResource"
import { ActionList } from "react-data-form"
import type { ViewResourceInterface } from "@/ViewResourceInterface"

// --- Mocks ---

const { mockPublish, mockPubSub } = vi.hoisted(() => {
  const mockPublish = vi.fn()
  const mockPubSub = { publish: mockPublish, subscribe: vi.fn() }
  return { mockPublish, mockPubSub }
})

const mockHttpRepo = {
  getCollection: vi.fn(),
  getItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  replaceItem: vi.fn(),
}


const mockLocalStorageRepo = {
  getCollection: vi.fn(),
  getItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  replaceItem: vi.fn(),
}
// Both repositories now live in one package, so they share a single mock.
vi.mock("jsonld-repository", () => ({
  httpRepository: () => mockHttpRepo,
  localStorageRepository: () => mockLocalStorageRepo,
}))

vi.mock("coooking-pubsub", () => ({
  createPubSub: () => mockPubSub,
}))

// --- Tests ---

describe("createResource", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("early return", () => {
    it("returns the resourceOption untouched when resourceBuild is true", () => {
      const alreadyBuilt = {
        "@id": "my_items",
        resourceBuild: true,
        getCollection: vi.fn(),
        getItem: vi.fn(),
        createItem: vi.fn(),
        updateItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as ViewResourceInterface

      const result = createViewResource("my_items", alreadyBuilt as any)
      expect(result).toBe(alreadyBuilt)
    })
  })

  describe("basic construction", () => {
    it("sets resourceBuild to true once built", () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      expect(resource.resourceBuild).toBe(true)
    })

    it('positionne @type à "view-resource"', () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      expect(resource["@type"]).toBe("view-resource")
    })

    it("derives the name from @id when none is given", () => {
      const resource = createViewResource("/api/my_items", {
        path: "/api/my_items",
      })
      expect(resource.name).toBe("my_items")
    })

    it("keeps the given name", () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        name: "Mes Éléments",
      })
      expect(resource.name).toBe("Mes Éléments")
    })

    it("creates an onChange through createPubSub", () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      expect(resource.onChange).toBe(mockPubSub)
    })
  })

  describe("views", () => {
    it("creates a view for every action of ActionList", () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      const expectedActions = Object.values(ActionList)
      expectedActions.forEach((action) => {
        expect(resource.views).toHaveProperty(action)
      })
    })

    it("merges the global view with the per-action ones", () => {
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        view: { name: "Vue globale" },
        views: {
          list: { name: "Vue liste" },
        },
      })
      // list overrides global
      expect((resource.views as any).list.name).toBe("Vue liste")
      // read inherits global
      expect((resource.views as any).read.name).toBe("Vue globale")
    })
  })

  describe("repository selection", () => {
    it("uses httpRepository when a path is given", async () => {
      mockHttpRepo.getCollection.mockResolvedValue({ data: { member: [] } })
      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      await resource.getCollection()
      expect(mockHttpRepo.getCollection).toHaveBeenCalled()
    })

    it("uses localStorageRepository when no path is given", async () => {
      mockLocalStorageRepo.getCollection.mockResolvedValue({ data: { member: [] } })
      const resource = createViewResource("my_items", {})
      await resource.getCollection()
      expect(mockLocalStorageRepo.getCollection).toHaveBeenCalled()
    })
  })

  describe("getCollection decorator", () => {
    it("applies preGetCollection when defined", async () => {
      mockHttpRepo.getCollection.mockResolvedValue({ data: { member: [] } })
      const preGetCollection = vi.fn((p: any) => ({ ...p, extra: true }))

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        preGetCollection,
      })
      await resource.getCollection({ page: 1 })

      expect(preGetCollection).toHaveBeenCalledWith({ page: 1 }, undefined)
      expect(mockHttpRepo.getCollection).toHaveBeenCalledWith(
        expect.objectContaining({ extra: true }),
        undefined
      )
    })

    it("merges context.currentResource.filter into the params", async () => {
      mockHttpRepo.getCollection.mockResolvedValue({ data: { member: [] } })

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      const context = {
        viewResourceContext: { filter: { status: "active" } },
      } as any
      await resource.getCollection({ page: 1 }, context)

      expect(mockHttpRepo.getCollection).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, status: "active" }),
        context
      )
    })
  })

  describe("getItem decorator", () => {
    it("applies preGetItem when defined", async () => {
      const item = { "@id": "/api/my_items/1" }
      mockHttpRepo.getItem.mockResolvedValue({ data: item })
      const preGetItem = vi.fn((p: any) => ({ ...p, enriched: true }))

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        preGetItem,
      })
      await resource.getItem({ "@id": "/api/my_items/1" })

      expect(preGetItem).toHaveBeenCalledWith(
        { "@id": "/api/my_items/1" },
        undefined
      )
      expect(mockHttpRepo.getItem).toHaveBeenCalledWith(
        expect.objectContaining({ enriched: true }),
        undefined
      )
    })
  })

  describe("removeItem decorator", () => {
    it("publishes onChange with ActionList.remove and the params", async () => {
      mockHttpRepo.removeItem.mockResolvedValue({})
      const params = { "@id": "/api/my_items/1" }

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      await resource.removeItem(params)

      expect(mockPublish).toHaveBeenCalledWith({
        data: params,
        action: ActionList.delete,
      })
    })
  })

  describe("updateItem decorator", () => {
    it("publishes onChange with ActionList.update after the call", async () => {
      const updatedItem = { "@id": "/api/my_items/1", name: "updated" }
      mockHttpRepo.updateItem.mockResolvedValue({ data: updatedItem })

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      await resource.updateItem({ "@id": "/api/my_items/1", name: "updated" })

      expect(mockPublish).toHaveBeenCalledWith({
        data: updatedItem,
        action: ActionList.update,
      })
    })

    it("applies preUpdate when defined", async () => {
      const updatedItem = { "@id": "/api/my_items/1", name: "updated" }
      mockHttpRepo.updateItem.mockResolvedValue({ data: updatedItem })
      const preUpdate = vi.fn((p: any) => ({ ...p, transformed: true }))

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        preUpdate,
      })
      await resource.updateItem({ "@id": "/api/my_items/1" })

      expect(preUpdate).toHaveBeenCalledWith({ "@id": "/api/my_items/1" }, undefined)
      expect(mockHttpRepo.updateItem).toHaveBeenCalledWith(
        expect.objectContaining({ transformed: true })
      )
    })
  })

  describe("createItem decorator", () => {
    it("publishes onChange with ActionList.create after the call", async () => {
      const createdItem = { "@id": "/api/my_items/2", name: "new" }
      mockHttpRepo.createItem.mockResolvedValue({ data: createdItem })

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
      })
      await resource.createItem({ name: "new" })

      expect(mockPublish).toHaveBeenCalledWith({
        data: createdItem,
        action: ActionList.create,
      })
    })

    it("applies preCreate when defined", async () => {
      const createdItem = { "@id": "/api/my_items/2", name: "new" }
      mockHttpRepo.createItem.mockResolvedValue({ data: createdItem })
      const preCreate = vi.fn((p: any) => ({ ...p, enriched: true }))

      const resource = createViewResource("my_items", {
        path: "/api/my_items",
        preCreate,
      })
      await resource.createItem({ name: "new" })

      expect(preCreate).toHaveBeenCalledWith({ name: "new" }, undefined)
      expect(mockHttpRepo.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ enriched: true })
      )
    })
  })
})
