# Mise — Claude Working Guide

## Project Overview

Mise is a personal recipe app built by a former 2-Michelin-star chef. Work tickets are tracked as [GitHub Issues](https://github.com/trroev/mise/issues), organised into [Milestones](https://github.com/trroev/mise/milestones).

**Stack:** Next.js 16 (App Router) + PayloadCMS 3 (embedded) · MongoDB Atlas · MiniSearch (in-browser) · Tailwind v4 · Base UI · TanStack Query · Turborepo + pnpm workspaces · Biome

---

## Tooling

- **Formatter/Linter:** Biome (extends `ultracite/biome/core|react|next`). Run `pnpm lint` and `pnpm format` from root.
- **Type checking:** `pnpm typecheck` from root.
- **Tests:** Vitest via `pnpm test`. Shared config in `packages/testing`.
- **Package manager:** pnpm. Always use `pnpm add`, never `npm install`.

---

## Conventions

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/). Group changes logically and atomically — one concern per commit.

```
feat(utils): add scaleIngredients function
fix(web): correct ISR revalidation path for recipe detail
chore(deps): install ts-pattern in packages/utils
```

### TypeScript
Full conventions are documented in [`docs/typescript-conventions.md`](./docs/typescript-conventions.md). Key rules enforced by Biome:

| Rule | Enforcement |
|---|---|
| `type` not `interface` | Biome error |
| No `enum` — use `as const satisfies` | Biome error |
| `Array<T>` not `T[]` | Biome error |
| `import type` for type-only imports | Biome error |
| Named exports only | Biome error (Next.js App Router files exempted) |
| No `@ts-ignore` — use `@ts-expect-error` with description | Biome error |

Conventions that require discipline (not auto-enforced): readonly preference, boolean naming prefixes (`is`, `has`, `should`…), explicit return types on exports, `as const satisfies` for constants, null vs undefined semantics, generic `T` prefix, single-object argument pattern, prefer ts-pattern over `switch`/chained `if-else`.

### Package structure
- Types: PascalCase subdirectories — `src/Recipe/`, `src/Unit/`
- Utils: camelCase subdirectories with an `index.ts` entry — `src/formatDate/index.ts`, `src/utils/cn/index.ts`
- Components (in `packages/ui`): one PascalCase directory per component containing kebab-case files and a barrel — `src/components/Button/{button.tsx, button.variants.ts, index.ts}`. The `tailwind-variants` config lives in a sibling `<name>.variants.ts` only when the component has variants. Each directory is exposed via the package's wildcard exports (`./components/*` → `./src/components/*/index.ts`).
- Cross-directory imports use the package's TS path alias (e.g. `@mise/ui/utils/cn`); siblings inside the same directory use relative `./` imports.

### ts-pattern
Install per-package as needed (`pnpm add ts-pattern --filter <package>`). Use `match(...).exhaustive()` wherever possible to get compile-time exhaustiveness checking.

### Next.js App Router
Default exports are required for `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `route.ts`, etc. These files are exempted from the `noDefaultExport` rule. All other files use named exports.
