import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const findByID = vi.fn()
const remove = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findByID, delete: remove })),
}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

const stubUserViewer = (id = "u1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("deleteCollection", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    findByID.mockReset()
    remove.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { deleteCollection } = await import("./delete-collection")
    const result = await deleteCollection({ collectionId: "c1" })
    expect(result).toEqual({ status: "unauthenticated" })
  })

  it("should return validation-error when collectionId is empty", async () => {
    stubUserViewer()
    const { deleteCollection } = await import("./delete-collection")
    const result = await deleteCollection({ collectionId: "" })
    expect(result).toMatchObject({
      status: "validation-error",
      field: "collectionId",
    })
  })

  it("should return forbidden when the collection is missing", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce(null)
    const { deleteCollection } = await import("./delete-collection")
    const result = await deleteCollection({ collectionId: "c1" })
    expect(result).toEqual({ status: "forbidden" })
  })

  it("should return forbidden when the user does not own the collection", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u2" })
    const { deleteCollection } = await import("./delete-collection")
    const result = await deleteCollection({ collectionId: "c1" })
    expect(result).toEqual({ status: "forbidden" })
    expect(remove).not.toHaveBeenCalled()
  })

  it("should delete the collection when the user is the owner", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u1" })
    remove.mockResolvedValueOnce({})
    const { deleteCollection } = await import("./delete-collection")
    const result = await deleteCollection({ collectionId: "c1" })
    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "collections",
        id: "c1",
        overrideAccess: true,
      })
    )
    expect(result).toEqual({ status: "ok", data: { collectionId: "c1" } })
  })
})
