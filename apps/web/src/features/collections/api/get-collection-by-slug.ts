import "server-only"

import type { Collection } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

type GetCollectionBySlugInput = {
  ownerId: string
  slug: string
}

export const getCollectionBySlug = async ({
  ownerId,
  slug,
}: GetCollectionBySlugInput): Promise<Collection | null> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "collections",
    where: {
      and: [{ owner: { equals: ownerId } }, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}
