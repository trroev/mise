import "server-only"

import type { Collection } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

type ListCollectionsForOwnerInput = {
  ownerId: string
}

export const listCollectionsForOwner = async ({
  ownerId,
}: ListCollectionsForOwnerInput): Promise<Array<Collection>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "collections",
    where: { owner: { equals: ownerId } },
    depth: 0,
    overrideAccess: true,
    sort: "name",
  })
  return docs
}
