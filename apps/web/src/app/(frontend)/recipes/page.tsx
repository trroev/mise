import type { Metadata } from "next"
import { Suspense } from "react"
import { getPublishedRecipes } from "~/features/recipes/api/published-recipes"
import { RecipeFilterPanel } from "~/features/recipes/components/RecipeFilterPanel"
import { RecipeMobileFilterDrawer } from "~/features/recipes/components/RecipeMobileFilterDrawer"
import { RecipePagination } from "~/features/recipes/components/RecipePagination"
import { RecipeQueryInput } from "~/features/recipes/components/RecipeQueryInput"
import { RecipeResultGrid } from "~/features/recipes/components/RecipeResultGrid"
import { RecipeResultGridErrorBoundary } from "~/features/recipes/components/RecipeResultGridErrorBoundary"
import { RecipeSearchProvider } from "~/features/recipes/components/RecipeSearchProvider"
import { CardSaveButton } from "~/features/saved-recipes/components/SaveButton"

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
        <RecipeSearchProvider recipes={recipes}>
          <div className="flex flex-col gap-8">
            <RecipeQueryInput />
            <div className="flex items-start gap-8">
              <aside className="hidden w-56 shrink-0 lg:block">
                <RecipeFilterPanel />
              </aside>
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <RecipeResultGridErrorBoundary>
                  <RecipeResultGrid ActionsComponent={CardSaveButton} />
                </RecipeResultGridErrorBoundary>
                <RecipePagination />
              </div>
            </div>
            <RecipeMobileFilterDrawer>
              <RecipeFilterPanel />
            </RecipeMobileFilterDrawer>
          </div>
        </RecipeSearchProvider>
      </Suspense>
    </section>
  )
}
