import path from "node:path"
import { fileURLToPath } from "node:url"
import { sharedConfig } from "@mise/testing/vitest.shared"
import react from "@vitejs/plugin-react"
import { configDefaults, mergeConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const INTEGRATION_GLOB = "**/*.integration.test.{ts,tsx}"

// TEST_SCOPE: unset → unit only, "integration" → integration only, "all" → both.
const scope = process.env.TEST_SCOPE
const onlyIntegration = scope === "integration"
const includeIntegration = scope === "integration" || scope === "all"

export default mergeConfig(sharedConfig, {
  plugins: [react()],
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["@mise/testing/msw/setup"],
    globalSetup: includeIntegration
      ? ["@mise/testing/payload/global-setup"]
      : [],
    include: onlyIntegration ? [INTEGRATION_GLOB] : configDefaults.include,
    exclude: includeIntegration
      ? configDefaults.exclude
      : [...configDefaults.exclude, INTEGRATION_GLOB],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/__fixtures__/**",
        "src/**/*.d.ts",
      ],
    },
  },
})
