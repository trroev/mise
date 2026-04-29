import path from "node:path"
import { fileURLToPath } from "node:url"
import { env as authEnv } from "@mise/env/auth"
import { env as cloudinaryEnv } from "@mise/env/cloudinary"
import { env as payloadEnv } from "@mise/env/payload"
import { cloudinaryAdapter } from "@mise/payload/adapters/cloudinary"
import { Cuisines } from "@mise/payload/collections/Cuisines"
import { Ingredients } from "@mise/payload/collections/Ingredients"
import { Media } from "@mise/payload/collections/Media"
import { Recipes } from "@mise/payload/collections/Recipes"
import { Tags } from "@mise/payload/collections/Tags"
import { Units } from "@mise/payload/collections/Units"
import { Users } from "@mise/payload/collections/Users"
import type { Recipe } from "@mise/payload/payload-types"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { buildConfig } from "payload"

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
    collections: [Cuisines, Ingredients, Media, Recipes, Tags, Units, Users],
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
      seoPlugin({
        collections: ["recipes"],
        generateDescription: ({ doc }) =>
          (doc as Recipe).description?.slice(0, 160) ?? "",
        generateImage: ({ doc }) => {
          const heroImage = (doc as Recipe).heroImage
          return typeof heroImage === "object" && heroImage !== null
            ? heroImage.id
            : (heroImage ?? "")
        },
        generateTitle: ({ doc }) => (doc as Recipe).title,
        tabbedUI: true,
        uploadsCollection: "media",
      }),
    ],
    secret: payloadEnv.PAYLOAD_SECRET,
    typescript: {
      outputFile: path.resolve(dirname, "types", "payload-types.ts"),
    },
  })
}
