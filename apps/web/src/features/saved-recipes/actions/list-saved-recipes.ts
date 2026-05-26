"use server"

import "server-only"

import {
  listSavedRecipesForUser,
  type SavedRecipeRef,
} from "~/features/saved-recipes/api/list-saved-recipes"
import type { SavedRecipesActionResult } from "~/features/saved-recipes/types/result"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"

export type ListSavedRecipesData = ReadonlyArray<SavedRecipeRef>
export type ListSavedRecipesResult =
  SavedRecipesActionResult<ListSavedRecipesData>

const listSavedRecipesImpl = async (): Promise<ListSavedRecipesResult> => {
  const viewer = await getCurrentViewer()
  if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }
  const recipes = await listSavedRecipesForUser({ userId: viewer.user.id })
  return { status: "ok", data: recipes }
}

export const listSavedRecipes = serverAction(listSavedRecipesImpl, {
  fallback: {
    status: "error",
    message: "Could not load saved recipes. Please try again.",
  },
})
