"use server"

import "server-only"

import { getPayload } from "payload"
import type { SavedRecipesActionResult } from "~/features/saved-recipes/types/result"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type UnsaveRecipeInput = {
  recipeId: string
}

export type UnsaveRecipeData = { removed: number }
export type UnsaveRecipeResult = SavedRecipesActionResult<UnsaveRecipeData>

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

const unsaveRecipeImpl = async ({
  recipeId,
}: UnsaveRecipeInput): Promise<UnsaveRecipeResult> => {
  const viewer = await getCurrentViewer()
  if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }

  if (typeof recipeId !== "string" || recipeId.length === 0) {
    return { status: "error", message: "A recipe id is required." }
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: "saved-recipes",
    where: { user: { equals: viewer.user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingDoc = existing.docs[0]
  if (!existingDoc) {
    return { status: "ok", data: { removed: 0 } }
  }

  const currentIds = (existingDoc.recipes ?? []).map(toRecipeId)
  const nextIds = currentIds.filter((id) => id !== recipeId)
  const removed = currentIds.length - nextIds.length

  if (removed === 0) {
    return { status: "ok", data: { removed: 0 } }
  }

  await payload.update({
    collection: "saved-recipes",
    id: existingDoc.id,
    data: { recipes: nextIds },
    overrideAccess: true,
  })

  return { status: "ok", data: { removed } }
}

export const unsaveRecipe = serverAction(unsaveRecipeImpl, {
  fallback: {
    status: "error",
    message: "Could not unsave the recipe. Please try again.",
  },
})
