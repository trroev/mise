import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const find = vi.fn()
const create = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find, create })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/queries/current-viewer", () => ({
  getCurrentViewer,
}))

const stubUserViewer = (id = "payload-user-1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("saveRecipe", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    find.mockReset()
    create.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "r1" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should return unauthenticated for an admin viewer", async () => {
    getCurrentViewer.mockResolvedValueOnce({
      kind: "admin",
      admin: { id: "a1" },
    })
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "r1" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should return an error when recipeId is empty", async () => {
    stubUserViewer()
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "" })
    expect(result.status).toBe("error")
    expect(create).not.toHaveBeenCalled()
  })

  it("should create a new saved-recipe row when none exists", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({ docs: [] })
    create.mockResolvedValueOnce({ id: "sr-new" })
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "r1" })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "saved-recipes",
        data: { user: "u1", recipe: "r1" },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({
      status: "ok",
      data: { savedRecipeId: "sr-new" },
    })
  })

  it("should be idempotent when the recipe is already saved", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({ docs: [{ id: "sr-existing" }] })
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "r1" })
    expect(create).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: "ok",
      data: { savedRecipeId: "sr-existing" },
    })
  })

  it("should return an error when payload throws", async () => {
    stubUserViewer("u1")
    find.mockRejectedValueOnce(new Error("db down"))
    const { saveRecipe } = await import("./save-recipe")
    const result = await saveRecipe({ recipeId: "r1" })
    expect(result.status).toBe("error")
  })
})
