import "server-only"

import type { Unit } from "@mise/payload/payload-types"
import { getPayload } from "payload"
import config from "~/payload.config"

export const getUnits = async (): Promise<Array<Unit>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "units",
    sort: "name",
    limit: 0,
  })
  return docs
}
