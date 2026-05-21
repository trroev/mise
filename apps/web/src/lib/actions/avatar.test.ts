import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const find = vi.fn()
const update = vi.fn()
const uploadStream = vi.fn()
const destroy = vi.fn()
const cloudinaryConfig = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ find, update })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("~/lib/auth.server", () => ({
  auth: { api: { getSession } },
}))

vi.mock("@mise/env/cloudinary", () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "test-key",
    CLOUDINARY_API_SECRET: "test-secret",
  },
}))

vi.mock("cloudinary", () => ({
  v2: {
    config: cloudinaryConfig,
    uploader: {
      upload_stream: uploadStream,
      destroy,
    },
  },
}))

const makeFile = (
  name: string,
  type: string,
  bytes: number,
  contents: BlobPart = "x"
): File => {
  const file = new File([contents], name, { type })
  Object.defineProperty(file, "size", { value: bytes })
  return file
}

const stubSession = (userId = "ba-user-1") => {
  getSession.mockResolvedValueOnce({ user: { id: userId, email: "u@e.co" } })
}

const stubUserLookup = (
  docs: Array<{ id: string; avatar?: { publicId?: string | null } }> = [
    { id: "payload-user-1" },
  ]
) => {
  find.mockResolvedValueOnce({ docs })
}

const stubSuccessfulUpload = () => {
  uploadStream.mockImplementationOnce(
    (
      _options: unknown,
      callback: (
        error: unknown,
        result: { secure_url: string; public_id: string } | null
      ) => void
    ) => ({
      end: () =>
        callback(null, {
          secure_url: "https://cdn.example/avatar.jpg",
          public_id: "user-avatars/payload-user-1/abc",
        }),
    })
  )
}

describe("uploadAvatar", () => {
  beforeEach(() => {
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    uploadStream.mockReset()
    cloudinaryConfig.mockReset()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(new FormData())
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(uploadStream).not.toHaveBeenCalled()
  })

  it("rejects missing files", async () => {
    stubSession()
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(new FormData())
    expect(result.status).toBe("error")
    expect(uploadStream).not.toHaveBeenCalled()
  })

  it("rejects files over 5 MB", async () => {
    stubSession()
    const formData = new FormData()
    formData.set("avatar", makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "Avatar must be under 5 MB.",
    })
  })

  it("rejects disallowed mime types", async () => {
    stubSession()
    const formData = new FormData()
    formData.set("avatar", makeFile("evil.gif", "image/gif", 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "Avatar must be a JPEG, PNG, or WebP image.",
    })
  })

  it("returns error when the user record is missing", async () => {
    stubSession()
    stubUserLookup([])
    const formData = new FormData()
    formData.set("avatar", makeFile("a.jpg", "image/jpeg", 1024))
    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)
    expect(result).toEqual({
      status: "error",
      message: "User record not found.",
    })
  })

  it("uploads to user-avatars/{userId} and persists the URL", async () => {
    stubSession()
    stubUserLookup()
    stubSuccessfulUpload()
    update.mockResolvedValueOnce({})
    const formData = new FormData()
    formData.set("avatar", makeFile("a.jpg", "image/jpeg", 1024))

    const { uploadAvatar } = await import("./avatar")
    const result = await uploadAvatar(formData)

    expect(cloudinaryConfig).toHaveBeenCalledWith({
      cloud_name: "test-cloud",
      api_key: "test-key",
      api_secret: "test-secret",
    })
    expect(uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: "user-avatars/payload-user-1" }),
      expect.any(Function)
    )
    expect(update).toHaveBeenCalledWith({
      collection: "users",
      id: "payload-user-1",
      data: {
        avatar: {
          url: "https://cdn.example/avatar.jpg",
          publicId: "user-avatars/payload-user-1/abc",
        },
      },
      overrideAccess: true,
    })
    expect(result).toEqual({
      status: "success",
      url: "https://cdn.example/avatar.jpg",
      publicId: "user-avatars/payload-user-1/abc",
    })
  })
})

describe("removeAvatar", () => {
  beforeEach(() => {
    getSession.mockReset()
    find.mockReset()
    update.mockReset()
    destroy.mockReset()
  })

  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValueOnce(null)
    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()
    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    })
    expect(destroy).not.toHaveBeenCalled()
  })

  it("destroys the Cloudinary asset and clears the field", async () => {
    stubSession()
    stubUserLookup([
      { id: "payload-user-1", avatar: { publicId: "user-avatars/p1/abc" } },
    ])
    destroy.mockResolvedValueOnce({ result: "ok" })
    update.mockResolvedValueOnce({})

    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()

    expect(destroy).toHaveBeenCalledWith("user-avatars/p1/abc", {
      resource_type: "image",
    })
    expect(update).toHaveBeenCalledWith({
      collection: "users",
      id: "payload-user-1",
      data: { avatar: { url: null, publicId: null } },
      overrideAccess: true,
    })
    expect(result).toEqual({ status: "success" })
  })

  it("skips Cloudinary destroy when no publicId is stored", async () => {
    stubSession()
    stubUserLookup([{ id: "payload-user-1" }])
    update.mockResolvedValueOnce({})

    const { removeAvatar } = await import("./avatar")
    const result = await removeAvatar()

    expect(destroy).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalled()
    expect(result).toEqual({ status: "success" })
  })
})
