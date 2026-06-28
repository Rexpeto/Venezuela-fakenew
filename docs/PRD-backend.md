# PRD Backend - Portal Anti-Fake Venezuela

## Objetivo
Backend en Hono + oRPC + Cloudflare Workers que expone el contrato para el frontend y el MCP.

## User Stories principales
- Como usuario, quiero verificar claims sobre Venezuela.
- Como usuario, quiero ver patrones de desinformación.
- Como usuario, quiero hechos clave (key facts) para contexto.
- Como chatbot, quiero usar la misma lógica del MCP.

## API Surface (oRPC Procedures)

| Procedure | Input | Output |
|---|---|---|
| `verifyClaim` | `{ claim, context? }` | `VerificationResult` |
| `getAllPatterns` | — | `Pattern[]` |
| `getKeyFacts` | — | `KeyFacts` (objeto plano) |
| `searchSources` | `{ topic, limit? }` | `Source[]` |
| `chat` | `{ message, sessionId? }` | `ChatResponse` |

## Data Model
```
claims          — id, claim_text, context, created_at
verifications   — id, claim_id, verdict, confidence, explanation, patterns_detected, sources, created_at
chat_sessions   — id, started_at
chat_messages   — id, session_id, role, content, created_at
sources         — id, url, title, topic, verified, last_checked
```

## Integrations
| Service | Purpose |
|---|---|
| Tavily | Búsqueda en tiempo real |
| `packages/core` | Patrones, key facts y lógica de verificación compartida |
| Claude API | LLM para chatbot |

## Notas
- Usar @repo/core para key facts y patterns.
- getKeyFacts retorna objeto plano (categorías como political, economy, earthquakes, etc.)
- Alinear con el MCP.
