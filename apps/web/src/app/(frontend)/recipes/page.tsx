import { RecipeCard } from "@mise/ui/components/RecipeCard"
import type { Metadata } from "next"
import { getPayload } from "payload"
import config from "~/payload.config"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Recipes | Mise",
  description:
    "Browse the recipe collection — seasonal dishes, techniques, and the kitchen notes behind them.",
}

export default async function RecipesPage() {
  const payload = await getPayload({ config })
  const { docs: recipes } = await payload.find({
    collection: "recipes",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    depth: 1,
    limit: 0,
  })

  return (
    <section className="constrainer flex flex-col space-y-8 py-10">
      <h1 className="font-display text-heading-xl text-text-primary">
        Recipes
      </h1>
      {recipes.length === 0 ? (
        <p className="font-sans text-body-md text-text-secondary">
          No recipes yet — check back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
