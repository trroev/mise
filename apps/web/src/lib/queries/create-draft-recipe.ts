import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

type CreateDraftRecipeInput = {
  data: Partial<Recipe>
}

/**
 * Creates a new recipe in draft status.
 *
 * Uses `overrideAccess: true` because the public `recipes` collection access
 * rules require admin to create. The caller (`lib/actions/submit-recipe.ts`)
 * authorizes via `canSubmitRecipe(viewer)` and binds `authorUser` to the
 * verified session's Payload user — so creation is always scoped to the
 * authenticated identity, never an arbitrary caller-supplied author.
 */
export const createDraftRecipe = async ({
  data,
}: CreateDraftRecipeInput): Promise<{ id: string; slug: string | null }> => {
  const payload = await getPayload({ config })
  const created = await payload.create({
    collection: "recipes",
    // biome-ignore lint/suspicious/noExplicitAny: Payload's create signature is overly strict for our partial shape
    data: data as any,
    draft: true,
    overrideAccess: true,
  })
  return { id: String(created.id), slug: created.slug ?? null }
}
