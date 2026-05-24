"use server"

import "server-only"

import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"
import { getPayload } from "payload"
import type { SavedRecipesActionResult } from "~/features/saved-recipes/types/result"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import config from "~/payload.config"

type UnsaveRecipeInput = {
  recipeId: string
}

export type UnsaveRecipeData = { removed: number }
export type UnsaveRecipeResult = SavedRecipesActionResult<UnsaveRecipeData>

export const unsaveRecipe = async ({
  recipeId,
}: UnsaveRecipeInput): Promise<UnsaveRecipeResult> => {
  try {
    const viewer = await getCurrentViewer()
    if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
      return { status: "unauthenticated" }
    }

    if (typeof recipeId !== "string" || recipeId.length === 0) {
      return { status: "error", message: "A recipe id is required." }
    }

    const payload = await getPayload({ config })

    const { docs } = await payload.delete({
      collection: "saved-recipes",
      where: {
        and: [
          { user: { equals: viewer.user.id } },
          { recipe: { equals: recipeId } },
        ],
      },
      overrideAccess: true,
    })

    return { status: "ok", data: { removed: docs.length } }
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return {
      status: "error",
      message: "Could not unsave the recipe. Please try again.",
    }
  }
}
