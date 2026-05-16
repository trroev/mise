import { env } from "@mise/env/app"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${env.BASE_URL}/sitemap.xml`,
  }
}
