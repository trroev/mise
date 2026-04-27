import path from "node:path"
import { fileURLToPath } from "node:url"
import { env as authEnv } from "@mise/env/auth"
import { env as payloadEnv } from "@mise/env/payload"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { buildConfig } from "payload"
import { users } from "./collections/users"

const dirname = path.dirname(fileURLToPath(import.meta.url))

type CreatePayloadConfigOptions = {
  readonly baseDir: string
}

export function createPayloadConfig({ baseDir }: CreatePayloadConfigOptions) {
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
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
