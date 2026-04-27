import path from "node:path"
import { fileURLToPath } from "node:url"
import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { buildConfig } from "payload"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: "users",
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
      },
      fields: [],
    },
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
})
