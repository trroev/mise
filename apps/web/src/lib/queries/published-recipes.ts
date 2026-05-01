import type { Recipe } from "@mise/payload/payload-types"

export const publishedRecipesQueryKey = ["recipes", "published"] as const

export const fetchPublishedRecipes = async (): Promise<Array<Recipe>> => {
  const response = await fetch("/api/recipes")
  if (!response.ok) {
    throw new Error("Failed to fetch recipes")
  }
  return response.json()
}
