import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

export const getRecipesByAuthorUser = async (
  authorUserId: string
): Promise<Array<Recipe>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "recipes",
    where: { authorUser: { equals: authorUserId } },
    sort: "-createdAt",
    depth: 0,
    limit: 0,
    draft: true,
    overrideAccess: true,
  })
  return docs
}
