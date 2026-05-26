# Environment variables reference

All app config lives in `apps/web/.env.*`, encrypted with [dotenvx](https://dotenvx.com). This document is the plaintext reference of every variable the app reads — useful for anyone forking the template who needs to provision their own values.

To add or change a value:

```sh
# from apps/web/
dotenvx set SOME_SECRET "value" -f .env.development.local
```

## Core (required)

| Variable | Purpose |
|---|---|
| `BASE_URL` | Public origin of the deployed app. In Vercel, leave unset to fall back to `VERCEL_URL`. Required for local prod-mode runs. |
| `MONGODB_URI` | MongoDB connection string. Local dev → docker-compose container; preview/prod → MongoDB Atlas (see [atlas-setup.md](./atlas-setup.md)). |
| `PAYLOAD_SECRET` | PayloadCMS encryption secret. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_SECRET` | better-auth signing secret. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Canonical auth URL. Must match `BASE_URL` in production. |
| `REVALIDATION_SECRET` | Shared bearer token for `POST /api/revalidate`. Generate with `openssl rand -base64 32`. |

## Cloudinary (required for media uploads through Payload admin)

| Variable | Purpose |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |

## Sentry (optional)

`NEXT_PUBLIC_SENTRY_DSN` alone enables runtime error capture. To resolve stack traces to original source in the Sentry UI, the build environment also needs `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` so `withSentryConfig` can upload source maps during `next build`. See [README → Sentry](../README.md#sentry).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Client + server DSN. Without it, capture is a no-op. |
| `SENTRY_ORG` | Sentry org slug (build-time only). |
| `SENTRY_PROJECT` | Sentry project slug (build-time only). |
| `SENTRY_AUTH_TOKEN` | Auth token with `project:releases` + `org:read` scopes. Never commit — set in Vercel Project Settings → Environment Variables (Production scope, marked Sensitive). |

## Logging (optional)

| Variable | Purpose |
|---|---|
| `LOG_LEVEL` | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal`. Defaults: `info` in production, `debug` otherwise. |

## Escape hatch (CI only)

| Variable | Purpose |
|---|---|
| `SKIP_ENV_VALIDATION` | Skip `@t3-oss/env-nextjs` schema validation. Set in CI for steps that touch the Payload config without real credentials. Do not set locally. |

## Platform-provided

These are injected by Vercel and the Next.js runtime — not set by hand:

- `VERCEL_URL`
- `NODE_ENV`
- `NEXT_RUNTIME`
- `CI`
