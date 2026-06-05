import { defineConfig } from "vitest/config"

// @mise/testing's shared config is not used here because @mise/testing now
// (transitively) depends on @mise/logger — importing it would create a
// workspace cycle.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/index.ts", "src/logger/index.ts"],
    },
  },
})
