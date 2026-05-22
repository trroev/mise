import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // @vitejs/plugin-react resolves vite v8 types via Storybook's transitive
  // dep, while vitest pulls vite v7. Runtime is compatible — cast to silence.
  // biome-ignore lint/suspicious/noExplicitAny: vite version mismatch in types
  plugins: [react() as any],
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    passWithNoTests: true,
  },
})
