"use server"

import "server-only"

import { getPayload } from "payload"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type CreateCollectionInput = {
  name: string
}

export type CreateCollectionData = { collectionId: string }
export type CreateCollectionResult =
  CollectionsActionResult<CreateCollectionData>

const createCollectionImpl = async ({
  name,
}: CreateCollectionInput): Promise<CreateCollectionResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }

  const trimmed = typeof name === "string" ? name.trim() : ""
  if (trimmed.length === 0) {
    return {
      status: "validation-error",
      field: "name",
      message: "A collection name is required.",
    }
  }

  const payload = await getPayload({ config })
  const ownerId = viewer.user.id

  const existing = await payload.find({
    collection: "collections",
    where: {
      and: [{ owner: { equals: ownerId } }, { name: { equals: trimmed } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    return {
      status: "validation-error",
      field: "name",
      message: "A collection with this name already exists.",
    }
  }

  const created = await payload.create({
    collection: "collections",
    data: { name: trimmed, owner: ownerId },
    overrideAccess: true,
  })

  return { status: "ok", data: { collectionId: String(created.id) } }
}

export const createCollection = serverAction(createCollectionImpl, {
  fallback: {
    status: "validation-error",
    field: "name",
    message: "Could not create the collection. Please try again.",
  },
})
