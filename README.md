# Mise

A personal recipe application built by a former 2-Michelin-star chef. Fine-dining recipes with first-class unit conversion (metric ↔ US) and yield scaling.

Built on a Turborepo monorepo with Next.js 16 and PayloadCMS 3 embedded in a single Vercel deployment.

**Live:** [mise-wine.vercel.app](https://mise-wine.vercel.app)

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| CMS | PayloadCMS 3 (embedded) + `@payloadcms/plugin-seo` + live preview |
| Database | MongoDB Atlas |
| Auth | better-auth |
| Search | MiniSearch (in-browser, client-side index) |
| Images | Cloudinary (custom Payload storage adapter) |
| Styling | TailwindCSS v4 |
| Headless UI | Base UI |
| Forms | TanStack Form |
| Validation | Zod |
| Pattern matching | ts-pattern |
| Linting / formatting | Biome (via ultracite) |
| Component workshop | Storybook |
| Testing | Vitest |
| Hosting | Vercel |

---

## Repository Structure

```
mise/
├── apps/
│   ├── web/                # Next.js 16 + PayloadCMS (single deployment)
│   ├── docs/               # Project documentation site
│   └── storybook/          # Component workshop for @mise/ui
├── packages/
│   ├── auth/               # better-auth configuration
│   ├── env/                # Shared env loading + zod schema
│   ├── features/           # Feature-level modules (server actions, queries)
│   ├── payload/            # Payload collections, hooks, adapters
│   ├── tailwind/           # Tailwind v4 preset + design tokens
│   ├── testing/            # Shared Vitest config
│   ├── tsconfig/           # Shared TypeScript configs
│   ├── types/              # Shared TypeScript types
│   ├── ui/                 # Shared React components (Base UI wrappers)
│   ├── utils/              # Unit conversion and yield scaling utilities
│   └── storybook-config/   # Shared Storybook config
└── docs/                   # Operational runbooks and design docs
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 24
- pnpm (managed via corepack)
- Docker (for local MongoDB)

Enable corepack if you haven't:

```sh
corepack enable
```

### Start local services

MongoDB runs in Docker for local development. Start it before running the app:

```sh
docker compose up -d
```

This starts:

- **MongoDB** at `mongodb://localhost:27017` (data persisted in `mongodb_data` volume)

Search is handled client-side with MiniSearch — no separate service to run.

### Install

```sh
pnpm install
```

### Environment

All env files in `apps/web/` are encrypted with [dotenvx](https://dotenvx.com) and safe to commit. Only `.env.keys` (the private decryption key file) is gitignored.

| File | Purpose |
|---|---|
| `.env.development` | Development defaults |
| `.env.development.local` | Local overrides / secrets |
| `.env.production` | Production defaults |

`apps/web/.env.keys` is a symlink to the repo-root `.env.keys`. Obtain the key file from a teammate or your password manager and place it at the repo root before running the app.

To add a new secret:

```sh
# From apps/web/
dotenvx set SOME_SECRET "value" -f .env.development.local
```

This encrypts the value in place and updates `.env.keys`.

### Develop

```sh
pnpm dev
```

Starts the Next.js app (with embedded Payload admin at `/admin`) in watch mode.

### MongoDB Atlas

Local dev uses the Docker MongoDB container by default. PR preview deploys connect to the `mise_staging` Atlas database; production connects to `mise_production`. Both databases live on the same M0 cluster with separate per-database users.

- **Credentials:** the staging and production connection strings are stored in 1Password under **Mise — MongoDB Atlas (staging)** and **Mise — MongoDB Atlas (production)**.
- **Encrypted into the repo:** `MONGODB_URI` is set in `apps/web/.env.development` (staging) and `apps/web/.env.production` (production), encrypted via dotenvx.
- **Point local dev at staging Atlas:** copy the staging URI from 1Password into `MONGODB_URI` in `.env.local`. Production credentials must not be used locally.
- **Provisioning runbook:** see [`docs/atlas-setup.md`](./docs/atlas-setup.md) for the full setup, network-access policy, and how to recreate the cluster from scratch.

### Build

```sh
pnpm build
```

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Check linting and formatting (Biome via ultracite) |
| `pnpm lint:fix` | Auto-fix lint and formatting issues |
| `pnpm format` | Check formatting only |
| `pnpm format:fix` | Auto-fix formatting |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run test suite |

---

## ISR Revalidation

Recipe pages are statically rendered and revalidated on demand. The Payload Recipes collection has an `afterChange` hook that POSTs to the app's revalidation endpoint whenever a recipe is published or updated, so the live site reflects edits within a few seconds.

### Endpoint

`POST /api/revalidate`

- **Header:** `Authorization: Bearer $REVALIDATION_SECRET`
- **Body:** `{ "slug": "<recipe-slug>" }`
- **Effect:** revalidates `/recipes` and `/recipes/<slug>`

### Trigger manually

When a cache looks stale (e.g. after a manual DB edit that bypassed the hook), curl the endpoint directly:

```sh
curl -X POST https://mise-wine.vercel.app/api/revalidate \
  -H "Authorization: Bearer $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug":"almond-cream"}'
```

`REVALIDATION_SECRET` is stored in Vercel project env vars (Production scope). To get its value locally, run `vercel env pull` from `apps/web/`.

Revalidation failures are logged but do not fail the originating Payload save — the page just stays on its old static copy until the next time-based or manual revalidate.

---

## Data Migration (historical)

Three one-shot imports were run against the production database to seed the recipe corpus. The import tooling has since been removed; this section captures what was done and how to recover it if a fourth import is needed.

### Completed imports

| Date | Workbook | Recipes | Notes |
|---|---|--:|---|
| 2026-05-06 | `Trevor Recipe Database Savory.xlsx` | 187 | First run; established the shared transformations documented in [`docs/migration-mapping.md`](./docs/migration-mapping.md). |
| 2026-05-08 | `Trevor Recipe Database Pastry_Sweet.xlsx` | 88 | Same workbook layout; script gained a tighter footer heuristic and a `bunches → ea` mapping. |
| 2026-05-08 | `Trevor Bread Formulas.xlsx` | 12 | Different layout (sub-recipe blocks, col-E section headers, real human-unit yields); ran via a dedicated `scripts/migrate-bread-formulas.ts`. |

### Workflow that was used

1. Seed the `units` collection (`UNIT_SEEDS` in `packages/payload/src/collections/Units/index.ts`, plus a one-off `Sprig` unit added during the first run).
2. Run the migration script with `--dry-run` against the local Payload instance to validate transformations.
3. Re-run without `--dry-run` to insert all recipes as `_status: "draft"`.
4. Bulk-publish drafts via a one-shot script that wrapped `payload.update({ data: { _status: "published" } })` in a loop, allowing the `stampPublishedAt` hook to fire on first publish.
5. Spot-check in the admin and hand-fix any quirky entries.

Production imports were performed by pointing the script at the production `MONGODB_URI` (pulled from 1Password) on a workstation, not from CI.

### Recovering the scripts

The `scripts/` directory was deleted after the third import (along with the root `xlsx` and `zod` dev dependencies). To resurrect a script:

```sh
git log --oneline -- scripts/                  # find the relevant commit
git show <sha>:scripts/migrate-from-sheets.ts  # inspect
git checkout <sha> -- scripts/                 # restore the whole directory
pnpm add -DW xlsx zod                          # re-add deps
```

The field-by-field mapping and data-quality decisions live in [`docs/migration-mapping.md`](./docs/migration-mapping.md) — that document is the source of truth for any future import that follows the savory/pastry workbook shape.

---

## CI & Branch Protection

Pull requests are validated by `.github/workflows/ci.yml`, which runs on every PR and on pushes to `main`. The pipeline enforces:

- Clean lockfile (`pnpm install --frozen-lockfile`)
- Fresh Payload types (`payload generate:types` + `git diff --exit-code`)
- Lint, type check, tests, and a successful build

`SKIP_ENV_VALIDATION=true` is set for the entire job so steps that touch the Payload config don't require real credentials. `generate:types` and `build` invoke the `payload` and `next` binaries directly (bypassing the `pnpm with-env` dotenvx wrapper) so the private key is never needed in CI.

### Enabling branch protection on `main`

After the CI workflow has run at least once, require it to pass before merging via the GitHub UI:

1. Go to **Settings → Branches → Add branch protection rule**
2. Set the branch name pattern to `main`
3. Enable **Require status checks to pass before merging**
4. Search for and add **CI** as a required status check
5. Enable **Require branches to be up to date before merging**
6. Save the rule

Or via the CLI (run once after the first workflow run):

```sh
gh api repos/trroev/mise/branches/main/protection \
  --method PUT \
  --field 'required_status_checks={"strict":true,"contexts":["CI"]}' \
  --field 'enforce_admins=false' \
  --field 'required_pull_request_reviews=null' \
  --field 'restrictions=null'
```

---

## Deployment

The app deploys as a single Vercel project at [mise-wine.vercel.app](https://mise-wine.vercel.app). Payload's embedded architecture means no separate server process.

```sh
turbo run build --filter=web
```
