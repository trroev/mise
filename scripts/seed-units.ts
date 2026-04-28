/**
 * Seed the Units collection with UNIT_SEEDS.
 *
 * Usage:
 *   pnpm tsx scripts/seed-units.ts
 *
 * Requires .env.local (or equivalent) to be loaded beforehand, e.g.:
 *   dotenvx run -- pnpm tsx scripts/seed-units.ts
 *
 * Idempotent — skips units that already exist (matched by abbreviation).
 */

import { UNIT_SEEDS } from "@mise/payload/collections/Units"
import { getPayload } from "payload"
import config from "../apps/web/src/payload.config"

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
