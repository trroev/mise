import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import type { Metadata } from "next"
import { RecipeSearch } from "~/components/RecipeSearch"
import { publishedRecipesQueryKey } from "~/lib/queries/published-recipes"
import { getPublishedRecipes } from "~/lib/queries/published-recipes.server"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Recipes | Mise",
  description:
    "Browse the recipe collection — seasonal dishes, techniques, and the kitchen notes behind them.",
}

export default async function RecipesPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: publishedRecipesQueryKey,
    queryFn: getPublishedRecipes,
  })

  return (
    <section className="constrainer flex flex-col space-y-8 py-10">
      <h1 className="font-display text-heading-xl text-text-primary">
        Recipes
      </h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RecipeSearch />
      </HydrationBoundary>
    </section>
  )
}
