"use server"

import "server-only"

import { getPayload } from "payload"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { canManageCollection } from "~/lib/policies/can-manage-collection"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type RenameCollectionInput = {
  collectionId: string
  name: string
}

export type RenameCollectionData = { collectionId: string }
export type RenameCollectionResult =
  CollectionsActionResult<RenameCollectionData>

const renameCollectionImpl = async ({
  collectionId,
  name,
}: RenameCollectionInput): Promise<RenameCollectionResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }

  if (typeof collectionId !== "string" || collectionId.length === 0) {
    return {
      status: "validation-error",
      field: "collectionId",
      message: "A collection id is required.",
    }
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

  const existing = await payload.findByID({
    collection: "collections",
    id: collectionId,
    depth: 0,
    overrideAccess: true,
  })
  if (!existing) {
    return { status: "forbidden" }
  }
  if (!canManageCollection(viewer, existing)) {
    return { status: "forbidden" }
  }

  const ownerId = viewer.user.id
  const duplicate = await payload.find({
    collection: "collections",
    where: {
      and: [
        { owner: { equals: ownerId } },
        { name: { equals: trimmed } },
        { id: { not_equals: collectionId } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (duplicate.docs.length > 0) {
    return {
      status: "validation-error",
      field: "name",
      message: "A collection with this name already exists.",
    }
  }

  const updated = await payload.update({
    collection: "collections",
    id: collectionId,
    data: { name: trimmed },
    overrideAccess: true,
  })

  return { status: "ok", data: { collectionId: String(updated.id) } }
}

export const renameCollection = serverAction(renameCollectionImpl, {
  fallback: {
    status: "validation-error",
    field: "name",
    message: "Could not rename the collection. Please try again.",
  },
})
