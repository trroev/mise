import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import { cache } from "react"
import config from "~/payload.config"

export const getRecipeBySlug = cache(
  async (slug: string): Promise<Recipe | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "recipes",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      depth: 2,
      limit: 1,
    })
    return docs[0] ?? null
  }
)
