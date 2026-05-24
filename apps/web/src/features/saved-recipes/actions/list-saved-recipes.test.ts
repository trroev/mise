import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const listSavedRecipesForUser = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: vi.fn(),
}))

vi.mock("~/lib/queries/current-viewer", () => ({
  getCurrentViewer,
}))

vi.mock("~/features/saved-recipes/api/list-saved-recipes", () => ({
  listSavedRecipesForUser,
}))

describe("listSavedRecipes", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    listSavedRecipesForUser.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { listSavedRecipes } = await import("./list-saved-recipes")
    const result = await listSavedRecipes()
    expect(result).toEqual({ status: "unauthenticated" })
    expect(listSavedRecipesForUser).not.toHaveBeenCalled()
  })

  it("should return unauthenticated for an admin viewer", async () => {
    getCurrentViewer.mockResolvedValueOnce({
      kind: "admin",
      admin: { id: "a1" },
    })
    const { listSavedRecipes } = await import("./list-saved-recipes")
    const result = await listSavedRecipes()
    expect(result).toEqual({ status: "unauthenticated" })
    expect(listSavedRecipesForUser).not.toHaveBeenCalled()
  })

  it("should return saved-recipe docs scoped to the viewer", async () => {
    getCurrentViewer.mockResolvedValueOnce({
      kind: "user",
      user: { id: "u1" },
    })
    const docs = [{ id: "sr-1" }, { id: "sr-2" }]
    listSavedRecipesForUser.mockResolvedValueOnce(docs)
    const { listSavedRecipes } = await import("./list-saved-recipes")
    const result = await listSavedRecipes()
    expect(listSavedRecipesForUser).toHaveBeenCalledWith({ userId: "u1" })
    expect(result).toEqual({ status: "ok", data: docs })
  })

  it("should return an error when the fetcher throws", async () => {
    getCurrentViewer.mockResolvedValueOnce({
      kind: "user",
      user: { id: "u1" },
    })
    listSavedRecipesForUser.mockRejectedValueOnce(new Error("db down"))
    const { listSavedRecipes } = await import("./list-saved-recipes")
    const result = await listSavedRecipes()
    expect(result.status).toBe("error")
  })
})
