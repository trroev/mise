"use server"

import "server-only"

import { env as cloudinaryEnv } from "@mise/env/cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { headers } from "next/headers"
import { getPayload } from "payload"
import { auth } from "~/lib/auth.server"
import config from "~/payload.config"

// Cloudinary transform for header/profile thumbnail rendering:
//   c_thumb,g_face,w_96,h_96
// Compose by inserting after `/upload/` in the stored secure URL, or via
// `cloudinary.url(publicId, { transformation: [{ crop: "thumb", gravity: "face", width: 96, height: 96 }] })`.
export const AVATAR_THUMB_TRANSFORM = "c_thumb,g_face,w_96,h_96" as const

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number]

const isAllowedMimeType = (value: string): value is AllowedAvatarMimeType =>
  (ALLOWED_AVATAR_MIME_TYPES as ReadonlyArray<string>).includes(value)

export type UploadAvatarResult =
  | { status: "success"; url: string; publicId: string }
  | { status: "error"; message: string }

export type RemoveAvatarResult =
  | { status: "success" }
  | { status: "error"; message: string }

let isCloudinaryConfigured = false

const configureCloudinary = (): void => {
  if (isCloudinaryConfigured) {
    return
  }
  cloudinary.config({
    cloud_name: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
    api_key: cloudinaryEnv.CLOUDINARY_API_KEY,
    api_secret: cloudinaryEnv.CLOUDINARY_API_SECRET,
  })
  isCloudinaryConfigured = true
}

type CloudinaryUploadOutcome = {
  readonly secure_url: string
  readonly public_id: string
}

const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadOutcome> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, overwrite: true, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(new Error(error.message))
          return
        }
        if (!result) {
          reject(new Error("Cloudinary returned no result."))
          return
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })

type AvatarFileValidation =
  | { ok: true; file: File }
  | { ok: false; message: string }

const validateAvatarFile = (formData: FormData): AvatarFileValidation => {
  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Provide an image file under `avatar`." }
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "Avatar must be under 5 MB." }
  }
  if (!isAllowedMimeType(file.type)) {
    return {
      ok: false,
      message: "Avatar must be a JPEG, PNG, or WebP image.",
    }
  }
  return { ok: true, file }
}

export async function uploadAvatar(
  formData: FormData
): Promise<UploadAvatarResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "You must be signed in." }
  }

  const validation = validateAvatarFile(formData)
  if (!validation.ok) {
    return { status: "error", message: validation.message }
  }

  const payload = await getPayload({ config })
  const userDocs = await payload.find({
    collection: "users",
    where: { betterAuthId: { equals: session.user.id } },
    limit: 1,
    overrideAccess: true,
  })
  const userDoc = userDocs.docs[0]
  if (!userDoc) {
    return { status: "error", message: "User record not found." }
  }

  configureCloudinary()
  const buffer = Buffer.from(await validation.file.arrayBuffer())
  const uploaded = await uploadBufferToCloudinary(
    buffer,
    `user-avatars/${userDoc.id}`
  )

  await payload.update({
    collection: "users",
    id: userDoc.id,
    data: {
      avatar: { url: uploaded.secure_url, publicId: uploaded.public_id },
    },
    overrideAccess: true,
  })

  return {
    status: "success",
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  }
}

export async function removeAvatar(): Promise<RemoveAvatarResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "You must be signed in." }
  }

  const payload = await getPayload({ config })
  const userDocs = await payload.find({
    collection: "users",
    where: { betterAuthId: { equals: session.user.id } },
    limit: 1,
    overrideAccess: true,
  })
  const userDoc = userDocs.docs[0]
  if (!userDoc) {
    return { status: "error", message: "User record not found." }
  }

  const publicId = userDoc.avatar?.publicId
  if (publicId) {
    configureCloudinary()
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
  }

  await payload.update({
    collection: "users",
    id: userDoc.id,
    data: { avatar: { url: null, publicId: null } },
    overrideAccess: true,
  })

  return { status: "success" }
}
