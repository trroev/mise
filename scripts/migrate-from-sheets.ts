/**
 * Migrate the legacy "Trevor Recipe Database Savory" XLSX into the Payload
 * `recipes` collection.
 *
 * Source-format & transformation contract: docs/migration-mapping.md (RECIPE-037).
 *
 * Usage:
 *   dotenvx run \
 *     -f apps/web/.env.development.local \
 *     -f apps/web/.env.development \
 *     -- pnpm tsx scripts/migrate-from-sheets.ts \
 *       --input "/path/to/Trevor Recipe Database Savory.xlsx" \
 *       --env local \
 *       [--write] \
 *       [--limit 10]
 *
 * The env files live under `apps/web/` (Next.js loads them from the app
 * directory at runtime). When invoking from the repo root, point dotenvx
 * at them explicitly with `-f`.
 *
 * Defaults to dry-run. `--write` is required to persist. `--env production`
 * additionally requires a typed confirmation when combined with `--write`.
 *
 * Idempotent: upserts by slug. Run `scripts/seed-units.ts` first.
 */

import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { getPayload } from "payload"
import { match } from "ts-pattern"
import { read as readXlsx, utils as xlsxUtils } from "xlsx"
import { z } from "zod"

type Cli = {
  readonly input: string
  readonly env: "local" | "production"
  readonly write: boolean
  readonly limit: number | undefined
}

function parseCli(argv: ReadonlyArray<string>): Cli {
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag)
    return idx >= 0 ? argv[idx + 1] : undefined
  }
  const has = (flag: string): boolean => argv.includes(flag)

  if (has("--help") || has("-h")) {
    console.log(`
Usage: tsx scripts/migrate-from-sheets.ts --input <xlsx> --env <local|production> [--write] [--limit N]

  --input <path>       Path to the source .xlsx workbook (required).
  --env <local|prod>   Selects the safety posture. 'production' + '--write' requires confirmation.
  --write              Persist to the database. Without this flag the script runs as a dry-run.
  --limit <n>          Only process the first N recipe sheets (debugging aid).
  --help, -h           Show this message.
`)
    process.exit(0)
  }

  const input = get("--input")
  const env = get("--env")
  if (!input) {
    throw new Error("--input <path> is required")
  }
  if (env !== "local" && env !== "production") {
    throw new Error("--env must be 'local' or 'production'")
  }
  const limitRaw = get("--limit")
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined
  if (limitRaw && (Number.isNaN(limit) || (limit ?? 0) <= 0)) {
    throw new Error("--limit must be a positive integer")
  }

  return { input, env, write: has("--write"), limit }
}

async function confirmProductionWrite(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout })
  console.warn(
    "\n⚠️  About to WRITE to PRODUCTION. Type the word 'production' to proceed."
  )
  const answer = await rl.question("> ")
  rl.close()
  if (answer.trim() !== "production") {
    throw new Error("Aborted: confirmation did not match 'production'.")
  }
}

// Source row schema — the per-sheet model after extraction, before Payload mapping.
const SourceIngredientSchema = z.object({
  name: z.string().min(1),
  prepNote: z.string().optional(),
  rawQuantity: z.number().nullable(),
  rawUnit: z.string().nullable(),
})
type SourceIngredient = z.infer<typeof SourceIngredientSchema>

const SourceRecipeSchema = z.object({
  sheetName: z.string(),
  title: z.string().min(1),
  needsRevision: z.boolean(),
  ingredients: z.array(SourceIngredientSchema).min(1),
  steps: z.array(z.string().min(1)),
  attribution: z.string().nullable(),
})
type SourceRecipe = z.infer<typeof SourceRecipeSchema>

// Unit-string normalisation: case-folded source token → canonical abbreviation
// (matching seeds in @mise/payload/collections/Units). docs/migration-mapping.md §2.4.
const UNIT_NORMALISATION: ReadonlyMap<string, string> = new Map([
  ["g", "g"],
  ["kg", "kg"],
  ["mg", "mg"],
  ["ml", "ml"],
  ["l", "l"],
  ["oz", "oz"],
  ["lb", "lb"],
  ["tsp", "tsp"],
  ["tbsp", "tbsp"],
  ["fl oz", "fl oz"],
  ["cup", "cup"],
  ["c", "cup"],
  ["pt", "pt"],
  ["qt", "qt"],
  ["pc", "pc"],
  ["ea", "ea"],
  ["pinch", "pinch"],
  ["sprig", "sprig"],
])

type ExtractRowsFn = (
  sheet: ReturnType<typeof xlsxUtils.aoa_to_sheet>
) => Array<Array<unknown>>
const extractRows: ExtractRowsFn = (sheet) =>
  xlsxUtils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    blankrows: true,
    raw: true,
  }) as Array<Array<unknown>>

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function splitNamePrep(raw: string): {
  name: string
  prepNote: string | undefined
} {
  const idx = raw.indexOf(",")
  if (idx === -1) {
    return { name: raw.trim(), prepNote: undefined }
  }
  const name = raw.slice(0, idx).trim()
  const prepNote = raw.slice(idx + 1).trim() || undefined
  return { name, prepNote }
}

// Matches both proper `(needs rev.)` and Excel-31-char-truncated forms like
// `(needs rev.`, `(needs rev`, `(needs re`, `(needs r`, etc.
const NEEDS_REVISION_RE = /\s*\(needs\b[^)]*\)?\s*$/i

function stripNeedsRevision(title: string): {
  title: string
  needsRevision: boolean
} {
  if (NEEDS_REVISION_RE.test(title)) {
    return {
      title: title.replace(NEEDS_REVISION_RE, "").trim(),
      needsRevision: true,
    }
  }
  return { title: title.trim(), needsRevision: false }
}

function parseIngredients(
  rows: Array<Array<unknown>>
): Array<SourceIngredient> {
  const ingredients: Array<SourceIngredient> = []
  for (let r = 3; r <= 19; r++) {
    const row = rows[r]
    const nameRaw = row ? trimString(row[0]) : ""
    if (!nameRaw) {
      continue
    }
    const { name, prepNote } = splitNamePrep(nameRaw)
    ingredients.push({
      name,
      prepNote,
      rawQuantity: asNumber(row?.[1]),
      rawUnit: trimString(row?.[2]) || null,
    })
  }
  return ingredients
}

function collectColARowsAfter(
  rows: Array<Array<unknown>>,
  startRow: number
): Array<{ r: number; v: string }> {
  const out: Array<{ r: number; v: string }> = []
  for (let r = startRow; r < rows.length; r++) {
    const v = rows[r] ? trimString(rows[r]?.[0]) : ""
    if (v) {
      out.push({ r, v })
    }
  }
  return out
}

function splitMethodAndAttribution(colARows: Array<{ r: number; v: string }>): {
  steps: Array<string>
  attribution: string | null
} {
  if (colARows.length === 0) {
    return { steps: [], attribution: null }
  }
  const last = colARows.at(-1)
  if (!last) {
    return { steps: [], attribution: null }
  }
  const prev = colARows.length >= 2 ? colARows.at(-2) : undefined
  const isFooter =
    colARows.length === 1 || (prev !== undefined && last.r - prev.r >= 2)
  if (isFooter) {
    return {
      steps: colARows.slice(0, -1).map((e) => e.v),
      attribution: last.v,
    }
  }
  return { steps: colARows.map((e) => e.v), attribution: null }
}

function parseSheet(
  sheetName: string,
  rows: Array<Array<unknown>>
): SourceRecipe | null {
  // r0 col A: title; ingredient rows r3..r19 (A:C); method r24+ col A.
  // The `(needs rev.)` marker is on the sheet name, not the A1 title — but
  // strip it from both as a belt-and-braces fallback.
  const titleRaw = trimString(rows[0]?.[0])
  if (!titleRaw) {
    return null
  }
  const fromSheet = stripNeedsRevision(sheetName)
  const fromTitle = stripNeedsRevision(titleRaw)
  const needsRevision = fromSheet.needsRevision || fromTitle.needsRevision
  const title = fromTitle.title
  const ingredients = parseIngredients(rows)
  const { steps, attribution } = splitMethodAndAttribution(
    collectColARowsAfter(rows, 24)
  )
  return {
    sheetName,
    title,
    needsRevision,
    ingredients,
    steps,
    attribution,
  }
}

type UnitLookup = ReadonlyMap<string, string> // abbreviation → unit id

async function buildUnitLookup(
  payload: Awaited<ReturnType<typeof getPayload>>
): Promise<UnitLookup> {
  const result = await payload.find({
    collection: "units",
    limit: 1000,
    pagination: false,
  })
  const map = new Map<string, string>()
  for (const unit of result.docs) {
    map.set(unit.abbreviation, String(unit.id))
  }
  return map
}

type ResolveUnitResult =
  | {
      kind: "ok"
      unitId: string
      quantity: number
      prepNotePrefix: string | undefined
    }
  | { kind: "error"; reason: string }

function resolveIngredient(
  source: SourceIngredient,
  units: UnitLookup
): ResolveUnitResult {
  const rawUnit = (source.rawUnit ?? "").toLowerCase()

  // §3.4 — blank quantity OR `as needed` unit → quantity 0, mark "to taste".
  const isToTaste =
    source.rawQuantity == null || rawUnit === "as needed" || rawUnit === ""

  // §3.5 — drops & inches: convert to `ea` and inject a prep-note prefix.
  if (rawUnit === "drops") {
    const id = units.get("ea")
    if (!id) {
      return { kind: "error", reason: "missing 'ea' unit seed" }
    }
    const n = source.rawQuantity ?? 0
    return { kind: "ok", unitId: id, quantity: n, prepNotePrefix: `${n} drops` }
  }
  if (rawUnit === '"') {
    const id = units.get("ea")
    if (!id) {
      return { kind: "error", reason: "missing 'ea' unit seed" }
    }
    const n = source.rawQuantity ?? 0
    return {
      kind: "ok",
      unitId: id,
      quantity: 1,
      prepNotePrefix: `${n}-inch piece`,
    }
  }

  if (isToTaste) {
    const id = units.get("ea")
    if (!id) {
      return { kind: "error", reason: "missing 'ea' unit seed" }
    }
    return {
      kind: "ok",
      unitId: id,
      quantity: 0,
      prepNotePrefix: "to taste",
    }
  }

  const target = UNIT_NORMALISATION.get(rawUnit)
  if (!target) {
    return {
      kind: "error",
      reason: `unknown unit ${JSON.stringify(source.rawUnit)}`,
    }
  }
  const id = units.get(target)
  if (!id) {
    return {
      kind: "error",
      reason: `unit '${target}' not seeded — run scripts/seed-units.ts`,
    }
  }
  return {
    kind: "ok",
    unitId: id,
    quantity: source.rawQuantity ?? 0,
    prepNotePrefix: undefined,
  }
}

type RecipePayload = {
  title: string
  description?: string
  author?: string
  yield?: { quantity: number; unit: string }
  ingredientGroups: Array<{
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
      prepNote?: string
    }>
  }>
  instructionGroups: Array<{
    steps: Array<{ description: string }>
  }>
  _status: "draft"
}

type BuildResult =
  | { kind: "ok"; payload: RecipePayload }
  | { kind: "error"; errors: Array<string> }

function buildRecipePayload(
  source: SourceRecipe,
  units: UnitLookup
): BuildResult {
  const errors: Array<string> = []

  const ingredients: RecipePayload["ingredientGroups"][number]["ingredients"] =
    []
  let allGrams = true
  let totalGrams = 0
  for (const [i, ing] of source.ingredients.entries()) {
    const resolved = resolveIngredient(ing, units)
    if (resolved.kind === "error") {
      errors.push(`ingredient[${i}] (${ing.name}): ${resolved.reason}`)
      continue
    }
    const prepNote = [resolved.prepNotePrefix, ing.prepNote]
      .filter(Boolean)
      .join(", ")
    ingredients.push({
      name: ing.name,
      quantity: resolved.quantity,
      unit: resolved.unitId,
      ...(prepNote ? { prepNote } : {}),
    })
    if (ing.rawUnit?.toLowerCase() === "g" && ing.rawQuantity != null) {
      totalGrams += ing.rawQuantity
    } else {
      allGrams = false
    }
  }

  // §3.3 — TBD placeholder when method is empty.
  const stepsSource = source.steps.length > 0 ? source.steps : ["TBD"]
  const steps = stepsSource.map((description) => ({ description }))

  if (errors.length > 0) {
    return { kind: "error", errors }
  }

  const description = source.needsRevision ? "**Needs revision.**" : undefined
  const yieldField =
    allGrams && totalGrams > 0 ? { quantity: totalGrams, unit: "g" } : undefined

  return {
    kind: "ok",
    payload: {
      title: source.title,
      ...(description ? { description } : {}),
      ...(source.attribution ? { author: source.attribution } : {}),
      ...(yieldField ? { yield: yieldField } : {}),
      ingredientGroups: [{ ingredients }],
      instructionGroups: [{ steps }],
      _status: "draft",
    },
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type Counters = {
  processed: number
  inserted: number
  updated: number
  skipped: number
  failed: number
}

type SheetOutcome =
  | { kind: "skip"; reason: string }
  | { kind: "fail"; errors: Array<string> }
  | { kind: "dry"; slug: string; title: string }
  | { kind: "insert"; slug: string }
  | { kind: "update"; slug: string }

async function processSheet(
  sheetName: string,
  rows: Array<Array<unknown>>,
  units: UnitLookup,
  payload: Awaited<ReturnType<typeof getPayload>>,
  write: boolean
): Promise<SheetOutcome> {
  const parsed = parseSheet(sheetName, rows)
  if (!parsed) {
    return { kind: "skip", reason: "no title in A1" }
  }
  const validation = SourceRecipeSchema.safeParse(parsed)
  if (!validation.success) {
    return {
      kind: "fail",
      errors: validation.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      ),
    }
  }
  const built = buildRecipePayload(validation.data, units)
  if (built.kind === "error") {
    return { kind: "fail", errors: built.errors }
  }

  const slug = slugify(built.payload.title)
  if (!write) {
    return { kind: "dry", slug, title: built.payload.title }
  }

  const existing = await payload.find({
    collection: "recipes",
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return match(existing.totalDocs > 0)
    .returnType<Promise<SheetOutcome>>()
    .with(true, async () => {
      const id = existing.docs[0]?.id
      if (id == null) {
        throw new Error("found existing doc with missing id")
      }
      await payload.update({
        collection: "recipes",
        id,
        data: built.payload,
      })
      return { kind: "update", slug }
    })
    .with(false, async () => {
      await payload.create({
        collection: "recipes",
        data: built.payload,
      })
      return { kind: "insert", slug }
    })
    .exhaustive()
}

function recordOutcome(
  sheetName: string,
  outcome: SheetOutcome,
  counters: Counters,
  failures: Array<{ sheet: string; errors: Array<string> }>
): void {
  match(outcome)
    .with({ kind: "skip" }, ({ reason }) => {
      counters.skipped++
      console.warn(`  skip   ${sheetName} — ${reason}`)
    })
    .with({ kind: "fail" }, ({ errors }) => {
      counters.failed++
      failures.push({ sheet: sheetName, errors })
      console.warn(`  fail   ${sheetName} — ${errors.join("; ")}`)
    })
    .with({ kind: "dry" }, ({ slug, title }) => {
      console.log(`  dry    ${sheetName} → ${title} (slug=${slug})`)
    })
    .with({ kind: "insert" }, ({ slug }) => {
      counters.inserted++
      console.log(`  insert ${sheetName} → ${slug}`)
    })
    .with({ kind: "update" }, ({ slug }) => {
      counters.updated++
      console.log(`  update ${sheetName} → ${slug}`)
    })
    .exhaustive()
}

async function run(): Promise<void> {
  const cli = parseCli(process.argv.slice(2))

  console.log(
    `[migrate-from-sheets] input=${cli.input} env=${cli.env} write=${cli.write}${cli.limit ? ` limit=${cli.limit}` : ""}`
  )

  if (cli.env === "production" && cli.write) {
    await confirmProductionWrite()
  }

  const fs = await import("node:fs/promises")
  const buf = await fs.readFile(cli.input)
  const wb = readXlsx(buf, { type: "buffer" })

  const sheetNames = wb.SheetNames.filter((n) => n !== "Template")
  const targets = cli.limit ? sheetNames.slice(0, cli.limit) : sheetNames
  console.log(`[migrate-from-sheets] sheets to process: ${targets.length}`)

  const { default: config } = await import("../apps/web/src/payload.config")
  const payload = await getPayload({ config })
  const units = await buildUnitLookup(payload)

  const counters: Counters = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  }
  const failures: Array<{ sheet: string; errors: Array<string> }> = []

  for (const sheetName of targets) {
    counters.processed++
    const sheet = wb.Sheets[sheetName]
    if (!sheet) {
      counters.skipped++
      continue
    }
    const outcome = await processSheet(
      sheetName,
      extractRows(sheet),
      units,
      payload,
      cli.write
    )
    recordOutcome(sheetName, outcome, counters, failures)
  }

  console.log("\n[migrate-from-sheets] summary")
  console.log(`  processed: ${counters.processed}`)
  console.log(`  inserted:  ${counters.inserted}`)
  console.log(`  updated:   ${counters.updated}`)
  console.log(`  skipped:   ${counters.skipped}`)
  console.log(`  failed:    ${counters.failed}`)
  console.log(`  mode:      ${cli.write ? "WRITE" : "dry-run"}`)

  if (failures.length > 0) {
    console.log("\nfailures:")
    for (const f of failures) {
      console.log(`  - ${f.sheet}`)
      for (const e of f.errors) {
        console.log(`      ${e}`)
      }
    }
  }

  await payload.db.destroy()
}

run().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
