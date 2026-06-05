import { defineConfig } from "vitest/config"

// @mise/testing's shared config is not used here because @mise/testing
// depends on @mise/auth — importing it would create a workspace cycle.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/verificationEmail/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
    },
  },
})
