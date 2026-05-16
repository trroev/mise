import { env } from "@mise/env/app"
import type { MetadataRoute } from "next"
import { getPublishedRecipes } from "~/lib/queries/published-recipes"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getPublishedRecipes()

  const recipeEntries: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${env.BASE_URL}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: env.BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${env.BASE_URL}/recipes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...recipeEntries,
  ]
}
