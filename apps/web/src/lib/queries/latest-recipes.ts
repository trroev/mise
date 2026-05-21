import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"
import config from "~/payload.config"

export const LATEST_RECIPES_CACHE_TAG = "latest-recipes"

type GetLatestRecipesOptions = Readonly<{
  limit: number
  excludeId?: string
}>

export const getLatestRecipes = unstable_cache(
  async ({
    limit,
    excludeId,
  }: GetLatestRecipesOptions): Promise<Array<Recipe>> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "recipes",
      where: excludeId
        ? {
            and: [
              { _status: { equals: "published" } },
              { id: { not_equals: excludeId } },
            ],
          }
        : { _status: { equals: "published" } },
      sort: "-publishedAt",
      depth: 1,
      limit,
    })
    return docs
  },
  ["latest-recipes"],
  { tags: [LATEST_RECIPES_CACHE_TAG] }
)
