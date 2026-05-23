import "server-only"

import type { Cuisine } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

export const getCuisines = async (): Promise<Array<Cuisine>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "cuisines",
    sort: "name",
    limit: 0,
  })
  return docs
}
