# Product Roadmap

## Phase 1 — MVP

1. [ ] Migrate MCP into monorepo as `packages/mcp-server` — Port `ajcastrob/mcp-venezuela-fakenews` into the Bun workspace: swap `package-lock.json` for Bun-native deps, convert the Node.js entry to be Bun-compatible, verify all 4 tools (`get_fakenews_patterns`, `verify_claim`, `search_official_sources`, `generate_factcheck_report`) still work via `bun run inspect`. `S`

2. [ ] Extract shared data into `packages/core` — Move the `PATTERNS` array (6 patterns, already fully written) and `KEY_FACTS` object (political, economy, earthquakes, migration, disinformation) out of the MCP and into `packages/core` as the single source of truth. Export TypeScript types (`Pattern`, `KeyFact`) and Zod schemas for both. Add a `matchPatterns(claim: string)` helper (logic already exists in the MCP's `verify_claim` tool). `S`

3. [ ] Add remaining shared types to `packages/core` — Define and export `VerificationResult`, `Source`, `ChatResponse` types and Zod schemas. These don't exist yet in the MCP and are needed before the backend procedures. `S`

4. [ ] Database Schema and Migrations (`apps/backend`) — Define Drizzle ORM schema for `claims`, `verifications`, `chat_sessions`, `chat_messages`, and `sources` tables; generate and apply migrations against Turso/libsql. `S`

5. [ ] `verifyClaim` Procedure (`apps/backend`) — Implement the `verifyClaim({ claim, context? })` oRPC procedure: run `matchPatterns()` from `packages/core`, call Tavily for real-time source retrieval, call Claude API for structured verdict and explanation (upgrading the MCP's keyword-only logic), persist claim and verification to DB, return a `VerificationResult`. `L`

6. [ ] `getAllPatterns`, `getKeyFacts`, and `searchSources` Procedures (`apps/backend`) — Implement the three read-only oRPC procedures: patterns and key facts served from `packages/core`, source search via Tavily. `S`

7. [ ] `chat` Procedure and Session Persistence (`apps/backend`) — Implement the `chat({ message, sessionId? })` oRPC procedure: retrieve or create a chat session, load message history from DB, call Claude API with a grounded system prompt (key facts + Tavily search), persist assistant response, return a `ChatResponse` with the updated `sessionId`. `M`

8. [ ] UI Design — Wireframes (Michel) — Wireframes for Landing, `/verificar`, and `/chatbot` pages in Stitch. Share links with the team before frontend implementation begins. `S`

9. [ ] Landing Page — `/` (`apps/frontend`) — Build the Astro landing page with: hero section contextualizing the June 2026 earthquake, two primary CTAs ("Verificar una noticia" and "Preguntar al Chatbot"), a summary section on the most common disinformation patterns, and a footer with credits, sources, and repo link. `M`

10. [ ] Claim Verification Page — `/verificar` (`apps/frontend`) — Build the `/verificar` page with a textarea for claim input plus optional context field, a "Verificar" button that calls `verifyClaim` via the oRPC client, and a result card displaying verdict badge (Verdadero / Falso / Dudoso), confidence level, step-by-step explanation, detected patterns list, and linked official sources. `M`

11. [ ] Chatbot Page — `/chatbot` (`apps/frontend`) — Build the `/chatbot` page with a full-width chat interface that calls the `chat` procedure, preserves `sessionId` in `localStorage` so the session survives page reloads, and pre-seeds the conversation with a brief context message about the earthquake. `M`

12. [ ] Patterns Catalog Page — `/patrones` (`apps/frontend`) — Build the `/patrones` page that fetches `getAllPatterns()` and renders a browsable grid of `PatternCard` components, each showing the pattern name, description, and example messages. `S`

13. [ ] Verification History — Recent results list on `/verificar` showing the last N verifications from DB. `S`

14. [ ] Deployment — Backend and Frontend — Deploy `apps/backend` to Cloudflare Workers via `wrangler deploy`, configure `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` as Cloudflare secrets, and deploy `apps/frontend` to the chosen static hosting platform; verify all oRPC procedures are reachable from the live frontend. `M`

---

## Phase 2 — Post-MVP

14. [ ] Verification History — Persistent and Shareable — Extend the `/verificar` page to display a list of recent verifications stored in DB, and add shareable result URLs so users can link directly to a specific verification result. `M`

15. [ ] Admin Panel — Source and Pattern Management — Build a password-protected admin interface for adding/editing knowledge base sources and disinformation patterns without redeploying. `L`

16. [ ] Image and Video Analysis — Extend `verifyClaim` to accept media URLs; use Claude's vision capabilities or a third-party service to analyze images and video thumbnails for manipulation indicators. `XL`

17. [ ] Multi-language Support — Add English-language UI and procedure responses, with a language toggle on the frontend and locale-aware prompts in the Claude API calls. `L`

18. [ ] User Authentication and Personal History — Add optional user accounts (email/OAuth) so authenticated users can access their personal verification history across devices. `L`

19. [ ] User-submitted Claim Moderation Queue — Allow users to flag and submit new claims for expert review; build a moderation queue in the admin panel where editors can approve, reject, or annotate submissions before they enter the knowledge base. `L`

20. [ ] Mobile App — Build a React Native or Expo mobile client that exposes the same `verifyClaim` and `chat` functionality via the existing oRPC backend. `XL`

21. [ ] Expanded Source Integrations — Integrate additional Venezuelan and Latin American monitoring organizations (e.g., automated ingestion from Observatorio Venezolano de Fake News RSS feeds, Factchequeado API) to keep the knowledge base current without manual updates. `M`

---

> Notes
> - Items are ordered by technical dependencies: MCP migration first, then `packages/core` extraction, then backend procedures, then frontend pages.
> - Each item represents an end-to-end (data + API + UI where applicable) functional and testable feature.
> - The monorepo scaffold (`apps/backend`, `apps/frontend`, `packages/core`, `packages/mcp-server`) is already initialized — no bootstrapping tasks are included.
> - The MCP server (`ajcastrob/mcp-venezuela-fakenews`) is already fully built with all 6 patterns and KEY_FACTS data — items 1–3 are migrations, not greenfield builds.
> - The MCP's `verify_claim` uses keyword matching; the portal's `verifyClaim` (item 5) upgrades this with Claude API for richer, structured verdicts.
> - Team assignments (Phase 1): items 1–3 owned by José Alejandro Castro; items 4–7 owned by Blure (rpindv) + Stephan Calderín; item 8 owned by Michel Novellino; items 9–13 owned by Carlos Gallardo + Michel Novellino; item 14 owned by Blure (rpindv).
