import type { Metadata } from "next"
import { Suspense } from "react"
import { RecipeSearch } from "~/components/RecipeSearch"
import { getPublishedRecipes } from "~/lib/queries/published-recipes"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Recipes | Mise",
  description:
    "Browse the recipe collection — seasonal dishes, techniques, and the kitchen notes behind them.",
}

export default async function RecipesPage() {
  const recipes = await getPublishedRecipes()

  return (
    <section className="constrainer flex flex-col space-y-8 py-10">
      <h1 className="font-display text-heading-xl text-text-primary">
        Recipes
      </h1>
      <Suspense>
        <RecipeSearch recipes={recipes} />
      </Suspense>
    </section>
  )
}
