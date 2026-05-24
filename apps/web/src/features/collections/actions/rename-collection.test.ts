import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const find = vi.fn()
const findByID = vi.fn()
const update = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find, findByID, update })),
}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

const stubUserViewer = (id = "u1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("renameCollection", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    find.mockReset()
    findByID.mockReset()
    update.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({ collectionId: "c1", name: "New" })
    expect(result).toEqual({ status: "unauthenticated" })
  })

  it("should return forbidden when the collection does not exist", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce(null)
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({ collectionId: "c1", name: "New" })
    expect(result).toEqual({ status: "forbidden" })
  })

  it("should return forbidden when the user does not own the collection", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u2" })
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({ collectionId: "c1", name: "New" })
    expect(result).toEqual({ status: "forbidden" })
    expect(update).not.toHaveBeenCalled()
  })

  it("should return validation-error when name is blank", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u1" })
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({ collectionId: "c1", name: "   " })
    expect(result).toMatchObject({ status: "validation-error", field: "name" })
  })

  it("should return validation-error when a sibling collection has the same name", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u1" })
    find.mockResolvedValueOnce({ docs: [{ id: "c2" }] })
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({ collectionId: "c1", name: "Other" })
    expect(result).toMatchObject({ status: "validation-error", field: "name" })
    expect(update).not.toHaveBeenCalled()
  })

  it("should update the collection when the new name is unique", async () => {
    stubUserViewer("u1")
    findByID.mockResolvedValueOnce({ id: "c1", owner: "u1" })
    find.mockResolvedValueOnce({ docs: [] })
    update.mockResolvedValueOnce({ id: "c1" })
    const { renameCollection } = await import("./rename-collection")
    const result = await renameCollection({
      collectionId: "c1",
      name: "  Renamed  ",
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "collections",
        id: "c1",
        data: { name: "Renamed" },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({ status: "ok", data: { collectionId: "c1" } })
  })
})
