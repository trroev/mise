"use server"

import "server-only"

import { getPayload } from "payload"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { canManageCollection } from "~/lib/policies/can-manage-collection"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type DeleteCollectionInput = {
  collectionId: string
}

export type DeleteCollectionData = { collectionId: string }
export type DeleteCollectionResult =
  CollectionsActionResult<DeleteCollectionData>

const deleteCollectionImpl = async ({
  collectionId,
}: DeleteCollectionInput): Promise<DeleteCollectionResult> => {
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

  await payload.delete({
    collection: "collections",
    id: collectionId,
    overrideAccess: true,
  })

  return { status: "ok", data: { collectionId } }
}

export const deleteCollection = serverAction(deleteCollectionImpl, {
  fallback: {
    status: "validation-error",
    field: "collectionId",
    message: "Could not delete the collection. Please try again.",
  },
})
