import type { Metadata } from "next"
import { Suspense } from "react"
import { RecipeSearch } from "~/components/RecipeSearch"
import { getPublishedRecipes } from "~/lib/queries/published-recipes"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse the recipe collection — seasonal dishes, techniques, and the kitchen notes behind them.",
  openGraph: {
    title: "Recipes",
    description:
      "Browse the recipe collection — seasonal dishes, techniques, and the kitchen notes behind them.",
    images: [
      {
        url: "/og-listing.jpg",
        width: 1200,
        height: 630,
        alt: "Mise recipe collection",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
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
