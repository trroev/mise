import path from "node:path"
import { fileURLToPath } from "node:url"
import { env as authEnv } from "@mise/env/auth"
import { env as cloudinaryEnv } from "@mise/env/cloudinary"
import { env as payloadEnv } from "@mise/env/payload"
import { Media } from "@mise/payload/collections/Media"
import { Users } from "@mise/payload/collections/Users"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage"
import { buildConfig } from "payload"
import { cloudinaryAdapter } from "./adapters/cloudinary"
import { Units } from "./collections/units"

const dirname = path.dirname(fileURLToPath(import.meta.url))

type CreatePayloadConfigOptions = {
  readonly baseDir: string
}

export function createPayloadConfig({ baseDir }: CreatePayloadConfigOptions) {
  return buildConfig({
    admin: {
      autoLogin:
        payloadEnv.PAYLOAD_ADMIN_EMAIL && payloadEnv.PAYLOAD_ADMIN_PASSWORD
          ? {
              email: payloadEnv.PAYLOAD_ADMIN_EMAIL,
              password: payloadEnv.PAYLOAD_ADMIN_PASSWORD,
              prefillOnly: payloadEnv.PAYLOAD_ADMIN_PREFILL_ONLY,
            }
          : undefined,
      avatar: "gravatar",
      importMap: {
        baseDir,
      },
      meta: {
        titleSuffix: " | Mise",
      },
      user: Users.slug,
    },
    collections: [Media, Units, Users],
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
