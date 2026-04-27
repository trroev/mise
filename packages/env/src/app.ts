import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
})

export { env }
