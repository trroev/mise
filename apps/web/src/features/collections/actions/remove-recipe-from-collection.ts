"use server"

import "server-only"

import { getPayload } from "payload"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { canManageCollection } from "~/lib/policies/can-manage-collection"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type RemoveRecipeFromCollectionInput = {
  collectionId: string
  recipeId: string
}

export type RemoveRecipeFromCollectionData = {
  collectionId: string
  recipeIds: Array<string>
  removed: number
}
export type RemoveRecipeFromCollectionResult =
  CollectionsActionResult<RemoveRecipeFromCollectionData>

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

const removeRecipeFromCollectionImpl = async ({
  collectionId,
  recipeId,
}: RemoveRecipeFromCollectionInput): Promise<RemoveRecipeFromCollectionResult> => {
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
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    return {
      status: "validation-error",
      field: "recipeId",
      message: "A recipe id is required.",
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

  const currentIds = (existing.recipes ?? []).map(toRecipeId)
  const nextIds = currentIds.filter((id) => id !== recipeId)
  const removed = currentIds.length - nextIds.length

  if (removed === 0) {
    return {
      status: "ok",
      data: {
        collectionId: String(existing.id),
        recipeIds: currentIds,
        removed: 0,
      },
    }
  }

  const updated = await payload.update({
    collection: "collections",
    id: collectionId,
    data: { recipes: nextIds },
    overrideAccess: true,
  })

  return {
    status: "ok",
    data: {
      collectionId: String(updated.id),
      recipeIds: nextIds,
      removed,
    },
  }
}

export const removeRecipeFromCollection = serverAction(
  removeRecipeFromCollectionImpl,
  {
    fallback: {
      status: "validation-error",
      field: "recipeId",
      message: "Could not remove the recipe. Please try again.",
    },
  }
)
