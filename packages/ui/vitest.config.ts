import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  // @vitejs/plugin-react resolves vite v8 types via Storybook's transitive
  // dep, while vitest pulls vite v7. Runtime is compatible — cast to silence.
  // biome-ignore lint/suspicious/noExplicitAny: vite version mismatch in types
  plugins: [react() as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    passWithNoTests: true,
  },
})
