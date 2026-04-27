import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  },
  server: {
    PAYLOAD_SECRET: z.string(),
  },
})

export { env }
