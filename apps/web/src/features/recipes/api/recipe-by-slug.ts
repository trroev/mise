import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"
import { cache } from "react"
import config from "~/payload.config"

export const recipeBySlugCacheTag = (slug: string): string => `recipe:${slug}`

export const getRecipeBySlug = (slug: string): Promise<Recipe | null> =>
  unstable_cache(
    async (): Promise<Recipe | null> => {
      console.log(`[getRecipeBySlug] MISS slug=${slug}`)
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: "recipes",
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: "published" } },
          ],
        },
        depth: 2,
        limit: 1,
      })
      return docs[0] ?? null
    },
    ["recipe-by-slug", slug],
    { tags: [recipeBySlugCacheTag(slug)] }
  )()

export const getDraftRecipeBySlug = cache(
  async (slug: string): Promise<Recipe | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "recipes",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      draft: true,
      overrideAccess: true,
    })
    return docs[0] ?? null
  }
)
