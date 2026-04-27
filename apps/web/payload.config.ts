import path from "node:path"
import { fileURLToPath } from "node:url"
import { createPayloadConfig } from "@mise/payload"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default createPayloadConfig({
  baseDir: path.resolve(dirname),
  outputFile: path.resolve(dirname, "payload-types.ts"),
})
