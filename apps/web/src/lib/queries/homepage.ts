import "server-only"

import type { Homepage } from "@mise/payload/payload-types"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"
import config from "~/payload.config"

export const HOMEPAGE_CACHE_TAG = "homepage"

export const getHomepage = unstable_cache(
  async (): Promise<Homepage> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: "homepage",
      depth: 2,
    })
  },
  ["homepage"],
  { tags: [HOMEPAGE_CACHE_TAG] }
)
