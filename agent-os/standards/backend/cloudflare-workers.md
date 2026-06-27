# Cloudflare Workers Standards

## 1. No Node.js APIs

CF Workers run on V8 isolates, not Node.js. Forbidden APIs:

- `fs`, `path` — no filesystem access
- `process.env` — use the `env` parameter passed to the fetch handler
- `Buffer` — use `Uint8Array` or `TextEncoder`/`TextDecoder`
- `require()` — ESM only

Available: `crypto.randomUUID()`, `fetch`, `URL`, `WebCrypto`, `setTimeout` (limited).

Before using any Node built-in, check the [CF compatibility matrix](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).

## 2. Typed Env Bindings

Define all bindings in `src/types.ts`:

```ts
export interface Env {
  ANTHROPIC_API_KEY: string;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
}
```

Export the Hono app typed as `ExportedHandler<Env>`:

```ts
export default { fetch: app.fetch } satisfies ExportedHandler<Env>;
```

Access bindings only via the `env` parameter — never via `process.env`.

## 3. wrangler.toml Structure

```toml
name            = "portal-antifake-api"
main            = "src/index.ts"
compatibility_date = "2024-09-23"

[vars]
# Non-secret config only — committed to repo
ENVIRONMENT = "production"
```

- Secrets go in `.dev.vars` locally (gitignored) and via `wrangler secret put KEY` for production
- Never commit `.dev.vars`
- Non-secret vars can live in `[vars]`; anything sensitive must be a secret

## 4. Request Lifecycle — No Shared State

Each request is a fresh invocation in an isolated context. Rules:

- No module-level DB connections — create the Turso client inside the fetch handler
- No in-memory caches — use CF KV or D1 for persistence across requests
- No global mutable state

```ts
// WRONG — shared across requests
const db = createClient({ url: env.TURSO_URL }); // module level

// CORRECT — scoped to request
app.use("*", async (c, next) => {
  const db = createClient({ url: c.env.TURSO_URL, authToken: c.env.TURSO_AUTH_TOKEN });
  c.set("db", db);
  await next();
});
```

## 5. Local Development

Use `bunx wrangler dev` (not a plain Bun server) to emulate the CF Workers runtime:

```bash
bunx wrangler dev
```

This catches runtime compatibility issues early — V8-only APIs, missing globals, binding resolution. A plain `bun run` server bypasses CF's runtime entirely and will silently allow Node.js APIs that break in production.
