# Tech Stack — Portal AntiFake Venezuela

---

## Runtime and Package Manager

| Layer | Choice |
|---|---|
| Runtime | Bun |
| Package manager | Bun (`bun add`, `bun run`, `bunx`) |

**Rationale:** Bun provides fast installs, native TypeScript execution, and built-in dotenv loading. It is the single runtime across all workspaces — never `npm`, `npx`, or `yarn`. Environment variables are accessed via `Bun.env` (local) and `c.env` (Cloudflare Workers context in production), never `process.env`.

---

## Language

| Layer | Choice |
|---|---|
| Language | TypeScript (strict mode throughout) |
| Module system | Pure ESM — no `require()` or `module.exports` |

**Rationale:** All files are `.ts`. The full strict suite is enabled (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`). Relative imports always use `.js` extensions (TypeScript resolves them at emit time).

---

## Monorepo Tooling

| Layer | Choice |
|---|---|
| Monorepo | Bun workspaces |

**Rationale:** Bun workspaces eliminate the need for a separate tool like Turborepo or pnpm for this project's scale. Workspace packages are hoisted into a single `node_modules` at the root.

**Workspace layout:**

```
apps/
  backend/       — Hono API server + oRPC procedures
  frontend/      — Astro web application
packages/
  core/          — Shared types, Zod schemas, patterns, key facts, utilities
  mcp-server/    — MCP server exposing the knowledge base to AI agents
```

---

## Backend Framework

| Layer | Choice |
|---|---|
| HTTP framework | Hono |
| Deployment target | Cloudflare Workers (edge runtime) |

**Rationale:** Hono is lightweight, edge-compatible, and has zero Node.js dependencies. It is the only place raw HTTP concerns (middleware, CORS, entry point) live. Business logic is never added as raw Hono route handlers — all procedures go through oRPC.

**Hard constraint:** No Node.js built-ins (`fs`, `path`, `crypto`, `http`). Use Web APIs only (`fetch`, `Request`, `Response`, `crypto.subtle`). Any new dependency must be verified as edge-safe before adding.

---

## RPC Layer

| Layer | Choice |
|---|---|
| RPC | oRPC |

**Rationale:** oRPC provides a type-safe contract between server and client without generating code. Procedures are defined with Zod input/output schemas. The frontend imports the same router type and gets full autocompletion and type safety with zero boilerplate. oRPC is mounted as a Hono route (e.g., `app.use('/rpc', orpcHandler)`).

**Procedures (MVP):**

| Procedure | Input | Output |
|---|---|---|
| `verifyClaim` | `{ claim, context? }` | `VerificationResult` |
| `getAllPatterns` | — | `Pattern[]` |
| `getKeyFacts` | — | `KeyFact[]` |
| `searchSources` | `{ topic, limit? }` | `Source[]` |
| `chat` | `{ message, sessionId? }` | `ChatResponse` |

---

## ORM and Database

| Layer | Choice |
|---|---|
| ORM | Drizzle ORM |
| Database | SQLite via Turso (libsql) |
| Driver | `@libsql/client` |

**Rationale:** Drizzle is SQL-first and generates zero-overhead queries, making it compatible with the Cloudflare Workers edge runtime. Turso provides remote SQLite with replication, configured via `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables (Cloudflare secrets in production). All DB access goes through Drizzle — no raw SQL strings or direct libsql queries.

**Migrations:** Managed with `drizzle-kit`. Run `bunx drizzle-kit generate` then `bunx drizzle-kit migrate`.

---

## AI and LLM

| Layer | Choice |
|---|---|
| LLM provider | Anthropic Claude API |
| SDK | `@anthropic-ai/sdk` |
| Model | `claude-sonnet-4-6` |
| Environment variable | `ANTHROPIC_API_KEY` (Cloudflare secret) |

**Rationale:** Claude is used for two purposes: structured claim analysis (returning a verdict, confidence score, explanation, and detected patterns) and grounded chatbot responses (system-prompted with key facts and Tavily search results).

**Open Decision — LLM Integration Depth:** The current approach uses Claude API directly from the backend for both verification and chat. A lighter alternative would be rules-only verification via `packages/core` with Tavily for sources, reserving Claude only for the chatbot. The PRD and standards lean toward full Claude integration for richer analysis. This decision should be finalized before implementing `verifyClaim`.

---

## Web Search

| Layer | Choice |
|---|---|
| Real-time search | Tavily API |
| Package | `@tavily/core` |
| Environment variable | `TAVILY_API_KEY` (Cloudflare secret) |

**Rationale:** Tavily provides real-time web search optimized for LLM-grounded use cases. It is used in `verifyClaim` to retrieve current source articles and in `chat` to augment responses with up-to-date information beyond the static knowledge base.

---

## Frontend Framework

| Layer | Choice |
|---|---|
| Framework | Astro |
| Deployment target | TBD — Vercel or Cloudflare Pages (see open decision below) |

**Rationale:** Astro was chosen over Next.js for this project's use case: a content-heavy landing page plus a small number of interactive portal pages. Astro ships minimal JavaScript by default and supports islands architecture for the interactive components (ClaimVerifier, ChatInterface). The scaffold is already initialized under `apps/frontend`.

**Frontend components (MVP):** `ClaimVerifier`, `ChatInterface`, `PatternCard`, `SourceList`, `ResultCard`

**Open Decision — Frontend Deployment Platform:** Backend is confirmed on Cloudflare Workers. The frontend will deploy to either Vercel or Cloudflare Pages. Cloudflare Pages is preferred for unified infrastructure and edge delivery; Vercel is an alternative if Astro adapter compatibility is a concern. This must be resolved before the deployment phase.

---

## Shared Packages

### `packages/core`

Contains all logic that is runtime-agnostic and shared across consumers (backend API and MCP server):

- TypeScript types and Zod schemas (`VerificationResult`, `Pattern`, `KeyFact`, `Source`, `ChatResponse`)
- Disinformation pattern definitions and `matchPatterns(claim)` helper
- Key-facts dataset and lookup helpers
- Pure utility functions with no Hono or Cloudflare dependencies

Exported via a single barrel `packages/core/index.ts`. No procedure definitions, no request context, no `c.env` access.

### `packages/mcp-server`

Exposes the same knowledge base as the backend API to AI agents via the Model Context Protocol. Imports types and helpers from `packages/core`. Maintained in parallel with the backend so both consumers stay in sync.

---

## Validation

| Layer | Choice |
|---|---|
| Schema validation | Zod |

All external trust boundaries (Claude API responses, Tavily results, user input) are validated with Zod schemas. No `as SomeType` casts without prior `.parse()`. oRPC procedure inputs and outputs are defined as Zod schemas living in `packages/core/types/`.

---

## Out of Scope (MVP)

The following are explicitly excluded from the current stack:

- User authentication (no auth layer, no sessions, no JWT)
- Image or video analysis
- Multi-language support (Spanish only)
- Mobile app
