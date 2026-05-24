"use server"

import "server-only"

import type { SavedRecipe } from "@mise/payload/payload-types"
import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"
import { listSavedRecipesForUser } from "~/features/saved-recipes/api/list-saved-recipes"
import type { SavedRecipesActionResult } from "~/features/saved-recipes/types/result"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

export type ListSavedRecipesData = ReadonlyArray<SavedRecipe>
export type ListSavedRecipesResult =
  SavedRecipesActionResult<ListSavedRecipesData>

export const listSavedRecipes = async (): Promise<ListSavedRecipesResult> => {
  try {
    const viewer = await getCurrentViewer()
    if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
      return { status: "unauthenticated" }
    }
    const docs = await listSavedRecipesForUser({ userId: viewer.user.id })
    return { status: "ok", data: docs }
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return {
      status: "error",
      message: "Could not load saved recipes. Please try again.",
    }
  }
}
