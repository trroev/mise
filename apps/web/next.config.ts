import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  transpilePackages: [
    "@mise/auth",
    "@mise/env",
    "@mise/payload",
    "@mise/tailwind",
    "@mise/types",
    "@mise/ui",
    "@mise/utils",
  ],
}

export default withPayload(nextConfig)
