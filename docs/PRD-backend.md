# PRD — Backend: Portal AntiFake Venezuela

**Stack:** Hono · Bun · oRPC · Drizzle · SQLite (Turso) · Cloudflare Workers  
**Auth:** None  
**Status:** Planning — 2026-06-27

---

## Problem

During the June 2026 Venezuela earthquake, disinformation spread faster than verified news. People have no quick, reliable way to check if a claim, message, or source is real. The backend powers the verification engine and chatbot that address this.

---

## Goal

Expose a type-safe API (oRPC over Hono) that lets the frontend verify claims, serve the chatbot, and retrieve known disinformation patterns — all grounded in real sources.

---

## User Stories

### Claim Verification
- **As a user**, I want to submit a text claim and receive a verdict (Verdadero / Falso / Dudoso) with a confidence score, so I can quickly know if something is reliable.
- **As a user**, I want to see which disinformation patterns were detected in a claim, so I understand why it was flagged.
- **As a user**, I want to see the verified sources used to reach the verdict, so I can read further.

### Chatbot
- **As a user**, I want to ask questions about the earthquake (damage, aid, reconstruction) and receive answers grounded in verified information.
- **As a user**, I want the chatbot to flag messages as potentially false if they match known disinformation patterns.
- **As a user**, I want my chat session to persist across page reloads so I don't lose context.

### Patterns & Knowledge
- **As a user**, I want to browse the catalog of known fake news patterns so I can recognize them myself.
- **As a developer/AI agent**, I want to query key facts and patterns via the same API the frontend uses, so the MCP server shares the same knowledge base.

### History
- **As a user**, I want recent verifications to be saved, so I or others can reference them without re-submitting.

---

## API Surface (oRPC Procedures)

| Procedure | Input | Output |
|---|---|---|
| `verifyClaim` | `{ claim, context? }` | `VerificationResult` |
| `getAllPatterns` | — | `Pattern[]` |
| `getKeyFacts` | — | `KeyFact[]` |
| `searchSources` | `{ topic, limit? }` | `Source[]` |
| `chat` | `{ message, sessionId? }` | `ChatResponse` |

---

## Data Model

```
claims          — id, claim_text, context, created_at
verifications   — id, claim_id, verdict, confidence, explanation, patterns_detected, sources, created_at
chat_sessions   — id, started_at
chat_messages   — id, session_id, role, content, created_at
sources         — id, url, title, topic, verified, last_checked
```

---

## Integrations

| Service | Purpose |
|---|---|
| Tavily | Real-time web search to support verification |
| `packages/core` | Shared patterns, key facts, and verification logic |
| Claude API | LLM for chatbot responses and claim analysis |

---

## Out of Scope (MVP)

- User authentication
- User-submitted claim moderation
- Image/video analysis
- Multi-language support

---

## Success Criteria (MVP)

- [ ] `verifyClaim` returns a verdict + explanation for any text input
- [ ] At least 6 disinformation patterns detectable
- [ ] Chatbot responds with earthquake context using verified sources
- [ ] Deployed publicly on Cloudflare Workers
- [ ] All procedures callable from frontend via oRPC client
