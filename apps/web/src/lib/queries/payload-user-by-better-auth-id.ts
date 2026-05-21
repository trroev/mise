import "server-only"

import type { User } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import { cache } from "react"
import config from "~/payload.config"

export const getPayloadUserByBetterAuthId = cache(
  async (betterAuthId: string): Promise<User | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "users",
      where: { betterAuthId: { equals: betterAuthId } },
      limit: 1,
      overrideAccess: true,
    })
    return docs[0] ?? null
  }
)
