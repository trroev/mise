import "server-only"

import type { SavedRecipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

type ListSavedRecipesForUserInput = {
  userId: string
}

export const listSavedRecipesForUser = async ({
  userId,
}: ListSavedRecipesForUserInput): Promise<Array<SavedRecipe>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "saved-recipes",
    where: { user: { equals: userId } },
    sort: "-createdAt",
    depth: 1,
    overrideAccess: true,
    pagination: false,
  })
  return docs
}
