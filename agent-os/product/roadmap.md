# Product Roadmap

## Phase 1 — MVP

1. [x] Migrate MCP into monorepo as `packages/mcp-server` — Port `ajcastrob/mcp-venezuela-fakenews` into the Bun workspace: swap `package-lock.json` for Bun-native deps, convert the Node.js entry to be Bun-compatible, verify all 4 tools (`get_fakenews_patterns`, `verify_claim`, `search_official_sources`, `generate_factcheck_report`) still work via `bun run inspect`. `S`

2. [x] Extract shared data into `packages/core` — Move the `PATTERNS` array (6 patterns, already fully written) and `KEY_FACTS` object (political, economy, earthquakes, migration, disinformation) out of the MCP and into `packages/core` as the single source of truth. Export TypeScript types (`Pattern`, `KeyFact`) and Zod schemas for both. Add a `matchPatterns(claim: string)` helper (logic already exists in the MCP's `verify_claim` tool). `S`

3. [x] Add remaining shared types to `packages/core` — Define and export `VerificationResult`, `Source`, `ChatResponse` types and Zod schemas. These don't exist yet in the MCP and are needed before the backend procedures. `S`

4. [x] Database Schema and Migrations (`apps/backend`) — Define Drizzle ORM schema for `claims`, `verifications`, `chat_sessions`, `chat_messages`, and `sources` tables; generate and apply migrations against Turso/libsql. `S`

5. [x] `verifyClaim` Procedure (`apps/backend`) — Implement the `verifyClaim({ claim, context? })` oRPC procedure: run `matchPatterns()` from `packages/core`, call Tavily for real-time source retrieval, call Claude API for structured verdict and explanation (upgrading the MCP's keyword-only logic), persist claim and verification to DB, return a `VerificationResult`. `L`

6. [x] `getAllPatterns`, `getKeyFacts`, and `searchSources` Procedures (`apps/backend`) — Implement the three read-only oRPC procedures: patterns and key facts served from `packages/core`, source search via Tavily. `S`

7. [x] `chat` Procedure and Session Persistence (`apps/backend`) — Implement the `chat({ message, sessionId? })` oRPC procedure: retrieve or create a chat session, load message history from DB, call Claude API with a grounded system prompt (key facts + Tavily search), persist assistant response, return a `ChatResponse` with the updated `sessionId`. `M`

8. [x] UI Design — Wireframes (Michel) — Wireframes for Landing, `/verificar`, and `/chatbot` pages in Stitch. Share links with the team before frontend implementation begins. `S`

9. [x] Landing Page — `/` (`apps/frontend`) — Build the Astro landing page with: hero section contextualizing the June 2026 earthquake, two primary CTAs ("Verificar una noticia" and "Preguntar al Chatbot"), a summary section on the most common disinformation patterns, and a footer with credits, sources, and repo link. `M`

10. [ ] Claim Verification Page — `/verificar` (`apps/frontend`) — Build the `/verificar` page with a textarea for claim input plus optional context field, a "Verificar" button that calls `verifyClaim` via the oRPC client, and a result card displaying verdict badge (Verdadero / Falso / Dudoso), confidence level, step-by-step explanation, detected patterns list, and linked official sources. `M`

11. [x] Chatbot Page — `/asistente` (`apps/frontend`) — Build the chat page with a full-width chat interface that calls the `chat` procedure, preserves `sessionId` in `localStorage` so the session survives page reloads, and pre-seeds the conversation with a brief context message about the earthquake. `M`

12. [x] Patterns Catalog Page — `/patrones` (`apps/frontend`) — Build the `/patrones` page that fetches `getAllPatterns()` and renders a browsable grid of `PatternCard` components, each showing the pattern name, description, and example messages. `S`

13. [x] Verification History — `getRecentVerifications` procedure returns last N verifications joined with claim text, ordered by most recent. `searchSources` now upserts Tavily results into the `sources` table. `verifyClaim` merges LLM-detected patterns with `detectPatterns()` from `@repo/core`. User IP captured via CF-Connecting-IP header. `S`

14. [ ] Frontend ↔ Backend Wiring — Switch frontend from mock data to real oRPC calls by setting `PUBLIC_MOCK_API=false` and pointing `BACKEND_URL` at the deployed backend. Validate all pages end-to-end. `S`

15. [ ] Deployment — Backend and Frontend — Deploy `apps/backend` to Cloudflare Workers via `wrangler deploy`. Required secrets (set via `wrangler secret put`): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `LLM_API_KEY`, `LLM_MODEL`, `TAVILY_API_KEY`, and **`CORS_ORIGIN`** (must be the exact frontend domain — backend defaults to `*` which is fail-open and must be locked before going live). Run `db:push` against the production Turso DB once before first deploy. Deploy `apps/frontend` to the chosen static hosting platform and verify all oRPC procedures are reachable. `M`

---

## Phase 2 — Post-MVP

15. [ ] Admin Panel — Source and Pattern Management (optional) — Interface for adding/editing knowledge base sources and disinformation patterns without redeploying. `L`

16. [ ] Image and Video Analysis — Extend `verifyClaim` to accept media URLs and analyze images/video thumbnails for manipulation indicators. `XL`

17. [ ] Multi-language Support — English-language UI and responses, language toggle on the frontend. `L`

18. [ ] User Authentication — Optional user accounts so authenticated users can access personal verification history across devices. `L`

19. [ ] User-submitted Claim Moderation Queue — Allow users to flag and submit claims for expert review; moderation queue for editors to approve, reject, or annotate before entering the knowledge base. `L`

20. [ ] Mobile App — Mobile client exposing `verifyClaim` and `chat` via the existing oRPC backend. `XL`

---

> Notes
> - Items are ordered by technical dependencies: MCP migration first, then `packages/core` extraction, then backend procedures, then frontend pages.
> - Each item represents an end-to-end (data + API + UI where applicable) functional and testable feature.
> - The monorepo scaffold (`apps/backend`, `apps/frontend`, `packages/core`, `packages/mcp-server`) is already initialized — no bootstrapping tasks are included.
> - The MCP server (`ajcastrob/mcp-venezuela-fakenews`) is already fully built with all 6 patterns and KEY_FACTS data — items 1–3 are migrations, not greenfield builds.
> - The MCP's `verify_claim` uses keyword matching; the portal's `verifyClaim` (item 5) upgrades this with Claude API for richer, structured verdicts.
> - Team assignments (Phase 1): items 1–3 owned by José Alejandro Castro; items 4–7 owned by Blure (rpindv) + Stephan Calderín; item 8 owned by Michel Novellino; items 9–13 owned by Carlos Gallardo + Michel Novellino; item 14 owned by Blure (rpindv).
