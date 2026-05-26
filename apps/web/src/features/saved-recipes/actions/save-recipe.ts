"use server"

import "server-only"

import { getPayload } from "payload"
import type { SavedRecipesActionResult } from "~/features/saved-recipes/types/result"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"
import config from "~/payload.config"

type SaveRecipeInput = {
  recipeId: string
}

export type SaveRecipeData = { savedRecipeId: string }
export type SaveRecipeResult = SavedRecipesActionResult<SaveRecipeData>

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

const saveRecipeImpl = async ({
  recipeId,
}: SaveRecipeInput): Promise<SaveRecipeResult> => {
  const viewer = await getCurrentViewer()
  if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }

  if (typeof recipeId !== "string" || recipeId.length === 0) {
    return { status: "error", message: "A recipe id is required." }
  }

  const payload = await getPayload({ config })
  const userId = viewer.user.id

  const existing = await payload.find({
    collection: "saved-recipes",
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingDoc = existing.docs[0]
  if (existingDoc) {
    const currentIds = (existingDoc.recipes ?? []).map(toRecipeId)
    if (currentIds.includes(recipeId)) {
      return { status: "ok", data: { savedRecipeId: String(existingDoc.id) } }
    }
    const updated = await payload.update({
      collection: "saved-recipes",
      id: existingDoc.id,
      data: { recipes: [...currentIds, recipeId] },
      overrideAccess: true,
    })
    return { status: "ok", data: { savedRecipeId: String(updated.id) } }
  }

  const created = await payload.create({
    collection: "saved-recipes",
    data: { user: userId, recipes: [recipeId] },
    overrideAccess: true,
  })

  return { status: "ok", data: { savedRecipeId: String(created.id) } }
}

export const saveRecipe = serverAction(saveRecipeImpl, {
  fallback: {
    status: "error",
    message: "Could not save the recipe. Please try again.",
  },
})
