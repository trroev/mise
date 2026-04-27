import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mise/auth",
    "@mise/env",
    "@mise/tailwind",
    "@mise/types",
    "@mise/ui",
    "@mise/utils",
  ],
}

export default nextConfig
