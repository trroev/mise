import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

type ListSavedRecipesForUserInput = {
  userId: string
}

export type SavedRecipeRef = string | Recipe

export const listSavedRecipesForUser = async ({
  userId,
}: ListSavedRecipesForUserInput): Promise<Array<SavedRecipeRef>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "saved-recipes",
    where: { user: { equals: userId } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) {
    return []
  }
  return doc.recipes ?? []
}
