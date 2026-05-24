import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentViewer = vi.fn()
const find = vi.fn()
const create = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find, create })),
}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

const stubUserViewer = (id = "u1") => {
  getCurrentViewer.mockResolvedValueOnce({ kind: "user", user: { id } })
}

describe("createCollection", () => {
  beforeEach(() => {
    vi.resetModules()
    getCurrentViewer.mockReset()
    find.mockReset()
    create.mockReset()
  })

  it("should return unauthenticated when no viewer is present", async () => {
    getCurrentViewer.mockResolvedValueOnce(null)
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "Weeknight" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should return unauthenticated for an admin viewer", async () => {
    getCurrentViewer.mockResolvedValueOnce({
      kind: "admin",
      admin: { id: "a1" },
    })
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "Weeknight" })
    expect(result).toEqual({ status: "unauthenticated" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should return validation-error when the name is blank", async () => {
    stubUserViewer()
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "   " })
    expect(result).toMatchObject({ status: "validation-error", field: "name" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should return validation-error when the name is already used by the owner", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({ docs: [{ id: "c-existing" }] })
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "Weeknight" })
    expect(result).toMatchObject({ status: "validation-error", field: "name" })
    expect(create).not.toHaveBeenCalled()
  })

  it("should create the collection when the name is unique for the owner", async () => {
    stubUserViewer("u1")
    find.mockResolvedValueOnce({ docs: [] })
    create.mockResolvedValueOnce({ id: "c-new" })
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "  Weeknight  " })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "collections",
        data: { name: "Weeknight", owner: "u1" },
        overrideAccess: true,
      })
    )
    expect(result).toEqual({ status: "ok", data: { collectionId: "c-new" } })
  })

  it("should return validation-error when payload throws", async () => {
    stubUserViewer("u1")
    find.mockRejectedValueOnce(new Error("db down"))
    const { createCollection } = await import("./create-collection")
    const result = await createCollection({ name: "Weeknight" })
    expect(result.status).toBe("validation-error")
  })
})
