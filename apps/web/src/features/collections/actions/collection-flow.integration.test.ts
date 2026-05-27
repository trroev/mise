import {
  type PayloadTestHarness,
  startPayloadTest,
} from "@mise/testing/payload"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { seedCollectionsFixtures } from "./__fixtures__/seed"

const getCurrentViewer = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

type CreateCollection = typeof import("./create-collection").createCollection
type AddRecipeToCollection =
  typeof import("./add-recipe-to-collection").addRecipeToCollection
type ListCollections = typeof import("./list-collections").listCollections

describe("collections action flow (integration)", () => {
  let harness: PayloadTestHarness
  let userId: string
  let recipeId: string
  let createCollection: CreateCollection
  let addRecipeToCollection: AddRecipeToCollection
  let listCollections: ListCollections

  beforeAll(async () => {
    harness = await startPayloadTest({
      loadPayload: async () => {
        const { getPayload } = await import("payload")
        const { default: config } = await import("~/payload.config")
        return getPayload({ config })
      },
    })

    const seed = await seedCollectionsFixtures(harness.payload)
    userId = seed.userId
    recipeId = seed.recipeId
    ;({ createCollection } = await import("./create-collection"))
    ;({ addRecipeToCollection } = await import("./add-recipe-to-collection"))
    ;({ listCollections } = await import("./list-collections"))
  })

  afterAll(async () => {
    await harness.teardown()
  })

  beforeEach(() => {
    getCurrentViewer.mockReset()
    getCurrentViewer.mockResolvedValue({ kind: "user", user: { id: userId } })
  })

  it("creates a collection, adds a recipe, then lists the recipe in it", async () => {
    const created = await createCollection({ name: "Weeknight Dinners" })
    expect(created.status).toBe("ok")
    if (created.status !== "ok") {
      throw new Error("expected collection creation to succeed")
    }
    const { collectionId } = created.data

    const added = await addRecipeToCollection({ collectionId, recipeId })
    expect(added.status).toBe("ok")
    if (added.status === "ok") {
      expect(added.data.recipeIds).toContain(recipeId)
    }

    const persisted = await harness.payload.findByID({
      collection: "collections",
      depth: 0,
      id: collectionId,
      overrideAccess: true,
    })
    expect((persisted.recipes ?? []).map(String)).toContain(recipeId)

    const listed = await listCollections()
    expect(listed.status).toBe("ok")
    if (listed.status === "ok") {
      const target = listed.data.find(
        (collection) => String(collection.id) === collectionId
      )
      expect(target).toBeDefined()
      expect((target?.recipes ?? []).map(String)).toContain(recipeId)
    }
  })
})
