/**
 * Seed the Units collection with UNIT_SEEDS.
 *
 * Usage:
 *   dotenvx run --convention=nextjs -- pnpm tsx scripts/seed-units.ts
 *
 * The `--convention=nextjs` flag is required so `.env.local` is loaded
 * (matches the convention used by the root `dev`/`build` scripts).
 *
 * Idempotent — skips units that already exist (matched by abbreviation).
 */

import { UNIT_SEEDS } from "@mise/payload/collections/Units"
import { getPayload } from "payload"
import config from "../apps/web/src/payload.config"

async function run(): Promise<void> {
  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0

  for (const unit of UNIT_SEEDS) {
    const existing = await payload.find({
      collection: "units",
      limit: 1,
      where: { abbreviation: { equals: unit.abbreviation } },
    })

    if (existing.totalDocs > 0) {
      console.log(`  skip  ${unit.abbreviation} (${unit.name})`)
      skipped++
      continue
    }

    await payload.create({
      collection: "units",
      data: unit,
    })

    console.log(`  create  ${unit.abbreviation} (${unit.name})`)
    created++
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`)

  await payload.db.destroy()
}

run().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
