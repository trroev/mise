import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

/**
 * Lists all recipes (including drafts) authored by a specific Payload user.
 *
 * Uses `overrideAccess: true` to include the caller's own drafts, which would
 * otherwise be filtered by the `recipes` collection access rules. Callers
 * MUST re-check authorization by confirming the requesting session's
 * `authorUserId` matches the value passed in — see `app/(frontend)/profile/page.tsx`,
 * which derives `authorUserId` from the resolved Payload user for the current
 * session before invoking this function.
 */
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
