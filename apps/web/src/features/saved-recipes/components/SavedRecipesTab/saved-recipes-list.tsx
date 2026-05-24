"use client"

import type { Recipe } from "@mise/payload/payload-types"
import Link from "next/link"
import { RecipeCard } from "~/features/recipes/components/RecipeCard"
import { CardSaveButton } from "~/features/saved-recipes/components/SaveButton"
import { useSavedRecipeIds } from "~/features/saved-recipes/hooks/use-saved-recipe-ids"

type SavedRecipesListProps = {
  initialRecipes: ReadonlyArray<Recipe>
}

export const SavedRecipesList = ({ initialRecipes }: SavedRecipesListProps) => {
  const { data: ids } = useSavedRecipeIds()
  const idSet =
    ids === undefined ? null : new Set<string>(ids.map((id) => String(id)))
  const visible =
    idSet === null
      ? initialRecipes
      : initialRecipes.filter((recipe) => idSet.has(String(recipe.id)))

  if (visible.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        You haven&apos;t saved any recipes yet.{" "}
        <Link className="underline" href="/recipes">
          Browse recipes
        </Link>{" "}
        and tap the heart to save them.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {visible.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard
            actions={<CardSaveButton recipeId={recipe.id} />}
            recipe={recipe}
          />
        </li>
      ))}
    </ul>
  )
}
