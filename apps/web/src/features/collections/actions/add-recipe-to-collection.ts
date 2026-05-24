"use server"

import "server-only"

import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"
import { getPayload } from "payload"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { canManageCollection } from "~/lib/policies/can-manage-collection"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import config from "~/payload.config"

type AddRecipeToCollectionInput = {
  collectionId: string
  recipeId: string
}

export type AddRecipeToCollectionData = {
  collectionId: string
  recipeIds: Array<string>
}
export type AddRecipeToCollectionResult =
  CollectionsActionResult<AddRecipeToCollectionData>

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

export const addRecipeToCollection = async ({
  collectionId,
  recipeId,
}: AddRecipeToCollectionInput): Promise<AddRecipeToCollectionResult> => {
  try {
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
    if (currentIds.includes(recipeId)) {
      return {
        status: "ok",
        data: { collectionId: String(existing.id), recipeIds: currentIds },
      }
    }

    const nextIds = [...currentIds, recipeId]
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
      },
    }
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return {
      status: "validation-error",
      field: "recipeId",
      message: "Could not add the recipe. Please try again.",
    }
  }
}
