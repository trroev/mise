import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const deleteFn = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ delete: deleteFn })),
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
    deleteFn.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(deleteFn).not.toHaveBeenCalled()
  })

  it("should return an error when recipeId is empty", async () => {
    stubUserViewer()
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "" })
    expect(result.status).toBe("error")
    expect(deleteFn).not.toHaveBeenCalled()
  })

  it("should delete saved-recipe rows scoped to viewer+recipe", async () => {
    stubUserViewer("u1")
    deleteFn.mockResolvedValueOnce({ docs: [{ id: "sr-1" }] })
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "saved-recipes",
        where: {
          and: [{ user: { equals: "u1" } }, { recipe: { equals: "r1" } }],
        },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({ status: "ok", data: { removed: 1 } })
  })

  it("should report zero removed when nothing matched", async () => {
    stubUserViewer("u1")
    deleteFn.mockResolvedValueOnce({ docs: [] })
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(result).toEqual({ status: "ok", data: { removed: 0 } })
  })

  it("should return an error when payload throws", async () => {
    stubUserViewer("u1")
    deleteFn.mockRejectedValueOnce(new Error("db down"))
    const { unsaveRecipe } = await import("./unsave-recipe")
    const result = await unsaveRecipe({ recipeId: "r1" })
    expect(result.status).toBe("error")
  })
})
