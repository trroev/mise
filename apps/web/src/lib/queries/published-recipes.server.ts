import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

export const getPublishedRecipes = async (): Promise<Array<Recipe>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "recipes",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    depth: 1,
    limit: 0,
  })
  return docs
}
