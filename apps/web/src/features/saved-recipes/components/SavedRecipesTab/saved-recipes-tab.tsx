import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import {
  listSavedRecipesForUser,
  type SavedRecipeRef,
} from "~/features/saved-recipes/api/list-saved-recipes"
import { SavedRecipesList } from "./saved-recipes-list"

type SavedRecipesTabProps = {
  payloadUserId: string
}

const isPopulatedRecipe = (ref: SavedRecipeRef): ref is Recipe =>
  typeof ref !== "string"

export const SavedRecipesTab = async ({
  payloadUserId,
}: SavedRecipesTabProps) => {
  const refs = await listSavedRecipesForUser({ userId: payloadUserId })
  const newestFirst = refs.filter(isPopulatedRecipe).reverse()
  return <SavedRecipesList initialRecipes={newestFirst} />
}
