import path from "node:path"
import { fileURLToPath } from "node:url"
import { sharedConfig } from "@mise/testing/vitest.shared"
import { mergeConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default mergeConfig(sharedConfig, {
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
    },
  },
})
