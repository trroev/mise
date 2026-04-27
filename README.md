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
| Search | Typesense Cloud |
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
    ├── migrate-from-sheets.ts   # CSV → Payload import
    ├── reindex-typesense.ts     # Full Typesense reindex
    └── setup-typesense.ts       # Create Typesense schema
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

This starts a MongoDB instance at `mongodb://localhost:27017`. Data is persisted in a named volume (`mongodb_data`).

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

# Populate the Typesense search index
pnpm tsx scripts/reindex-typesense.ts
```

See `docs/migration-mapping.md` for the Google Sheets → Payload field mapping.

---

## Deployment

The app deploys as a single Vercel project. Payload's embedded architecture means no separate server process.

```sh
turbo run build --filter=web
```
