import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const findByID = vi.fn()
const update = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findByID, update })),
}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

const stubUserViewer = (id = "u1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("addRecipeToCollection", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    findByID.mockReset()
    update.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { addRecipeToCollection } = await import("./add-recipe-to-collection")
    const result = await addRecipeToCollection({
      collectionId: "c1",
      recipeId: "r1",
    })
    expect(result).toEqual({ status: "unauthenticated" })
  })

  it("should return validation-error when recipeId is empty", async () => {
    stubUserViewer()
    const { addRecipeToCollection } = await import("./add-recipe-to-collection")
    const result = await addRecipeToCollection({
      collectionId: "c1",
      recipeId: "",
    })
    expect(result).toMatchObject({
      status: "validation-error",
      field: "recipeId",
    })
  })

  it("should return forbidden when the user does not own the collection", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u2", recipes: [] })
    const { addRecipeToCollection } = await import("./add-recipe-to-collection")
    const result = await addRecipeToCollection({
      collectionId: "c1",
      recipeId: "r1",
    })
    expect(result).toEqual({ status: "forbidden" })
    expect(update).not.toHaveBeenCalled()
  })

  it("should append the recipe when not already in the collection", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({
      id: "c1",
      owner: "u1",
      recipes: ["r-old"],
    })
    update.mockResolvedValueOnce({ id: "c1" })
    const { addRecipeToCollection } = await import("./add-recipe-to-collection")
    const result = await addRecipeToCollection({
      collectionId: "c1",
      recipeId: "r1",
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "collections",
        id: "c1",
        data: { recipes: ["r-old", "r1"] },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({
      status: "ok",
      data: { collectionId: "c1", recipeIds: ["r-old", "r1"] },
    })
  })

  it("should be idempotent when the recipe is already in the collection", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({
      id: "c1",
      owner: "u1",
      recipes: ["r1", "r2"],
    })
    const { addRecipeToCollection } = await import("./add-recipe-to-collection")
    const result = await addRecipeToCollection({
      collectionId: "c1",
      recipeId: "r1",
    })
    expect(update).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: "ok",
      data: { collectionId: "c1", recipeIds: ["r1", "r2"] },
    })
  })
})
