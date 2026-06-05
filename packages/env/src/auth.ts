import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { baseEnvOptions } from "./shared"

const env = createEnv({
  ...baseEnvOptions,
  experimental__runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined),
    EMAIL_FROM: process.env.EMAIL_FROM,
    MONGODB_URI: process.env.MONGODB_URI,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  server: {
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    EMAIL_FROM: z.string().optional(),
    MONGODB_URI: z.string(),
    RESEND_API_KEY: z.string().optional(),
  },
})

export { env }
