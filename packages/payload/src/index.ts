import { env as authEnv } from "@mise/env/auth"
import { env as payloadEnv } from "@mise/env/payload"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { buildConfig } from "payload"
import { users } from "./collections/users"

type CreatePayloadConfigOptions = {
  readonly baseDir: string
  readonly outputFile: string
}

export function createPayloadConfig({
  baseDir,
  outputFile,
}: CreatePayloadConfigOptions) {
  return buildConfig({
    admin: {
      importMap: {
        baseDir,
      },
      user: "users",
    },
    collections: [users],
    db: mongooseAdapter({
      url: authEnv.MONGODB_URI,
    }),
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile,
    },
  })
}
