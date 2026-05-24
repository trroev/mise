import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const find = vi.fn()
const update = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find, update })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/queries/current-viewer", () => ({
  getCurrentViewer,
}))

const stubUserViewer = (id = "payload-user-1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("unsaveRecipe", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    find.mockReset()
    update.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(update).not.toHaveBeenCalled()
  })

  it("should return an error when recipeId is empty", async () => {
    stubUserViewer()
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "" })
    expect(result.status).toBe("error")
    expect(update).not.toHaveBeenCalled()
  })

  it("should report zero removed when the user has no saved-recipes doc", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({ docs: [] })
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(update).not.toHaveBeenCalled()
    expect(result).toEqual({ status: "ok", data: { removed: 0 } })
  })

  it("should remove the recipe from the user's saved-recipes array", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({
      docs: [{ id: "sr-1", recipes: ["r-keep", "r1"] }],
    })
    update.mockResolvedValueOnce({ id: "sr-1" })
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "saved-recipes",
        id: "sr-1",
        data: { recipes: ["r-keep"] },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({ status: "ok", data: { removed: 1 } })
  })

  it("should report zero removed when the recipe is not in the user's list", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({
      docs: [{ id: "sr-1", recipes: ["r-other"] }],
    })
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(update).not.toHaveBeenCalled()
    expect(result).toEqual({ status: "ok", data: { removed: 0 } })
  })

  it("should return an error when payload throws", async () => {
    stubUserViewer("u1")
    find.mockRejectedValueOnce(new Error("db down"))
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(result.status).toBe("error")
  })
})
