/**
 * Bulk-publish every recipe in the `recipes` collection (one-shot, paired
 * with the post-migration step in docs/migration-mapping.md §5).
 *
 * Uses the Payload local API so the `stampPublishedAt` hook fires and each
 * recipe gets its `publishedAt` timestamp on first publish.
 *
 * Usage:
 *   dotenvx run \
 *     -f apps/web/.env.development.local \
 *     -f apps/web/.env.development \
 *     -- pnpm tsx scripts/publish-all-recipes.ts --env local [--write]
 *
 * Defaults to dry-run. `--write` is required to persist. `--env production`
 * additionally requires a typed confirmation when combined with `--write`.
 */

import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { getPayload } from "payload"

type Cli = {
  readonly env: "local" | "production"
  readonly write: boolean
}

function parseCli(argv: ReadonlyArray<string>): Cli {
  const has = (flag: string): boolean => argv.includes(flag)
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag)
    return idx >= 0 ? argv[idx + 1] : undefined
  }
  if (has("--help") || has("-h")) {
    console.log(`
Usage: tsx scripts/publish-all-recipes.ts --env <local|production> [--write]
`)
    process.exit(0)
  }
  const env = get("--env")
  if (env !== "local" && env !== "production") {
    throw new Error("--env must be 'local' or 'production'")
  }
  return { env, write: has("--write") }
}

async function confirmProductionWrite(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout })
  console.warn(
    "\n⚠️  About to PUBLISH all recipes in PRODUCTION. Type 'production' to proceed."
  )
  const answer = await rl.question("> ")
  rl.close()
  if (answer.trim() !== "production") {
    throw new Error("Aborted: confirmation did not match 'production'.")
  }
}

async function run(): Promise<void> {
  const cli = parseCli(process.argv.slice(2))
  console.log(
    `[publish-all-recipes] env=${cli.env} write=${cli.write ? "WRITE" : "dry-run"}`
  )

  if (cli.env === "production" && cli.write) {
    await confirmProductionWrite()
  }

  const { default: config } = await import("../apps/web/src/payload.config")
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: "recipes",
    depth: 0,
    limit: 1000,
    pagination: false,
  })

  console.log(`[publish-all-recipes] found ${result.docs.length} recipes`)

  let published = 0
  let alreadyPublished = 0
  let failed = 0

  for (const doc of result.docs) {
    if (doc._status === "published") {
      alreadyPublished++
      continue
    }
    if (!cli.write) {
      console.log(`  dry     ${doc.title}`)
      published++
      continue
    }
    try {
      await payload.update({
        collection: "recipes",
        id: doc.id,
        data: { _status: "published" },
      })
      console.log(`  publish ${doc.title}`)
      published++
    } catch (err) {
      failed++
      console.warn(
        `  fail    ${doc.title} — ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  console.log("\n[publish-all-recipes] summary")
  console.log(`  ${cli.write ? "published" : "would publish"}: ${published}`)
  console.log(`  already published:               ${alreadyPublished}`)
  console.log(`  failed:                          ${failed}`)

  await payload.db.destroy()
}

run().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
