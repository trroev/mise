# Mise

A personal recipe application built by a former 2-Michelin-star chef. Fine-dining recipes with first-class unit conversion (metric ↔ US) and yield scaling.

Built on a Turborepo monorepo with Next.js 16 and PayloadCMS 3 embedded in a single Vercel deployment.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| CMS | PayloadCMS 3 (embedded) |
| Database | MongoDB Atlas |
| Search | MiniSearch (in-browser, client-side index) |
| Images | Cloudinary |
| Styling | TailwindCSS v4 |
| Headless UI | Base UI |
| Client data | TanStack Query |
| Validation | Zod |
| Linting / formatting | Biome (via ultracite) |
| Testing | Vitest + Playwright (planned) |
| Hosting | Vercel |

---

## Repository Structure

```
mise/
├── apps/
│   └── web/              # Next.js 16 + PayloadCMS (single deployment)
├── packages/
│   ├── payload/          # Payload collections, hooks, and background jobs
│   ├── ui/               # Shared React components + Tailwind design tokens
│   ├── utils/            # Unit conversion and yield scaling utilities
│   ├── types/            # Shared TypeScript types
│   └── tsconfig/         # Shared TypeScript configs
└── scripts/
    └── migrate-from-sheets.ts   # CSV → Payload import
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

## Data Migration

Recipes are imported from Google Sheets via a one-time script:

```sh
# Validate without writing
pnpm tsx scripts/migrate-from-sheets.ts --input ./recipes.csv --dry-run

# Import to local Payload instance
pnpm tsx scripts/migrate-from-sheets.ts --input ./recipes.csv --env local
```

See `docs/migration-mapping.md` for the Google Sheets → Payload field mapping.

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

The app deploys as a single Vercel project. Payload's embedded architecture means no separate server process.

```sh
turbo run build --filter=web
```
