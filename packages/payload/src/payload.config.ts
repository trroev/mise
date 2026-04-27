import path from "node:path"
import { fileURLToPath } from "node:url"
import { env as authEnv } from "@mise/env/auth"
import { env as cloudinaryEnv } from "@mise/env/cloudinary"
import { env as payloadEnv } from "@mise/env/payload"
import { media } from "@mise/payload/collections/Media"
import { users } from "@mise/payload/collections/Users"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage"
import { buildConfig } from "payload"
import { cloudinaryAdapter } from "./adapters/cloudinary"

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
    collections: [media, users],
    db: mongooseAdapter({
      url: authEnv.MONGODB_URI,
    }),
    plugins: [
      cloudStoragePlugin({
        collections: {
          media: {
            adapter: cloudinaryAdapter({
              config: {
                cloud_name: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
                api_key: cloudinaryEnv.CLOUDINARY_API_KEY,
                api_secret: cloudinaryEnv.CLOUDINARY_API_SECRET,
              },
              folder: "mise",
            }),
            disableLocalStorage: true,
            disablePayloadAccessControl: true,
          },
        },
      }),
    ],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
