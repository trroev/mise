import type { Recipe } from "@mise/payload/payload-types"
import Link from "next/link"
import type { ComponentType } from "react"
import { RecipeCard } from "~/features/recipes/components/RecipeCard"

type LatestRecipesProps = {
  recipes: ReadonlyArray<Recipe>
  ActionsComponent?: ComponentType<{ recipeId: string }>
}

export function LatestRecipes({
  recipes,
  ActionsComponent,
}: LatestRecipesProps) {
  return (
    <section className="constrainer space-y-6 pb-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-heading-lg text-text-primary lg:text-heading-xl">
          Latest
        </h2>
        <Link
          className="font-sans text-body text-text-secondary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          href="/recipes"
        >
          See all
        </Link>
      </div>
      {recipes.length > 0 ? (
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                actions={
                  ActionsComponent ? (
                    <ActionsComponent recipeId={recipe.id} />
                  ) : undefined
                }
                recipe={recipe}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-sans text-body text-text-secondary">
          New recipes are on the way — check back soon.
        </p>
      )}
    </section>
  )
}
