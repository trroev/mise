"use server"

import "server-only"

import { headers } from "next/headers"
import { getPayload } from "payload"
import { auth } from "~/lib/auth.server"
import config from "~/payload.config"

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
  | { status: "success"; mediaId: string; url: string }
  | { status: "error"; message: string }

export type RemoveAvatarResult =
  | { status: "success" }
  | { status: "error"; message: string }

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

const extractAvatarId = (avatar: unknown): string | null => {
  if (typeof avatar === "string" || typeof avatar === "number") {
    return String(avatar)
  }
  if (
    avatar &&
    typeof avatar === "object" &&
    "id" in avatar &&
    (typeof avatar.id === "string" || typeof avatar.id === "number")
  ) {
    return String(avatar.id)
  }
  return null
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

  const previousAvatarId = extractAvatarId(userDoc.avatar)

  const buffer = Buffer.from(await validation.file.arrayBuffer())
  const altLabel = userDoc.name || session.user.email
  const media = await payload.create({
    collection: "media",
    data: { alt: `${altLabel} profile photo` },
    file: {
      data: buffer,
      mimetype: validation.file.type,
      name: validation.file.name || "avatar",
      size: validation.file.size,
    },
    overrideAccess: true,
  })

  await payload.update({
    collection: "users",
    id: userDoc.id,
    data: { avatar: media.id },
    overrideAccess: true,
  })

  if (previousAvatarId && previousAvatarId !== String(media.id)) {
    await payload
      .delete({
        collection: "media",
        id: previousAvatarId,
        overrideAccess: true,
      })
      .catch(() => {
        // Best-effort cleanup: don't fail the upload if the old asset is gone.
      })
  }

  return {
    status: "success",
    mediaId: String(media.id),
    url: media.url ?? "",
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

  const avatarId = extractAvatarId(userDoc.avatar)

  await payload.update({
    collection: "users",
    id: userDoc.id,
    data: { avatar: null },
    overrideAccess: true,
  })

  if (avatarId) {
    await payload
      .delete({
        collection: "media",
        id: avatarId,
        overrideAccess: true,
      })
      .catch(() => {
        // Best-effort: relation is already cleared.
      })
  }

  return { status: "success" }
}
