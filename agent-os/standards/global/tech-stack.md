## Tech Stack — Portal AntiFake Venezuela

Backend API for fake news detection. No frontend, no auth. Deployed to Cloudflare Workers.

---

### Runtime & Package Manager

- **Runtime:** Bun (not Node.js). Use `bun add`, `bun run`, `bunx` — never `npm`, `npx`, or `yarn`.
- **Language:** TypeScript (strict mode). All files `.ts`, no plain `.js`.

---

### Framework & API Layer

- **HTTP Framework:** Hono — lightweight, edge-compatible web framework.
- **RPC Layer:** oRPC — type-safe RPC built on top of Hono. Defines procedures (queries/mutations) with input/output schemas. Replaces REST route handlers. Client and server share the same type contract.
- **Relationship:** oRPC procedures are registered as a Hono route (e.g., `app.use('/rpc', orpcHandler)`). Do not add raw Hono routes for business logic — use oRPC procedures.

---

### Database & ORM

- **Database:** SQLite via Turso (libsql). Remote SQLite with replication.
- **ORM:** Drizzle ORM — SQL-first, schema-as-code. Schemas live in `src/db/schema.ts`.
- **Driver:** `@libsql/client` — the Turso client that Drizzle uses as its driver.
- **Connection:** Configured via `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables (Cloudflare secrets in production).
- **Migrations:** Managed with `drizzle-kit`. Run `bunx drizzle-kit generate` and `bunx drizzle-kit migrate`.

---

### AI & External APIs

- **LLM:** Claude API via `@anthropic-ai/sdk`. Model: `claude-sonnet-4-6`. Used for fake news analysis.
- **Search:** Tavily API (`@tavily/core`). Used to retrieve source articles for fact-checking.
- **Keys:** `ANTHROPIC_API_KEY`, `TAVILY_API_KEY` — stored as Cloudflare secrets, accessed via `c.env` in Hono.

---

### Deployment

- **Target:** Cloudflare Workers (edge runtime). Entry point: `src/index.ts`.
- **Config:** `wrangler.toml` at project root.
- **Hard constraint:** No Node.js built-ins (`fs`, `path`, `crypto`, `http`, etc.). Use Web APIs only (`fetch`, `Request`, `Response`, `crypto.subtle`). Hono and oRPC are edge-safe; verify any new dependency is also edge-safe before adding.
- **Deploy:** `bunx wrangler deploy`.

---

### Project Structure

```
src/
  index.ts          # Hono app entry, oRPC router mounted here
  db/
    schema.ts       # Drizzle table definitions
    client.ts       # Turso/libsql client setup
  procedures/       # oRPC procedure definitions (queries & mutations)
  lib/              # Shared utilities (Anthropic client, Tavily client)
drizzle/            # Generated migration files
wrangler.toml       # Cloudflare Workers config
drizzle.config.ts   # Drizzle Kit config
```

---

### Key Rules for AI Agents

1. Always use `bun` — never `npm`, `npx`, or `yarn`.
2. New API endpoints = new oRPC procedures, not raw Hono routes.
3. All DB access goes through Drizzle — no raw SQL strings, no direct libsql queries.
4. No Node.js APIs. If a library requires Node, find a Web-API-compatible alternative.
5. Environment variables are accessed via `c.env` (Hono context), not `process.env`.
