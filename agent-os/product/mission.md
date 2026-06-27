# Product Mission

## Pitch

Portal AntiFake Venezuela is a public web platform that helps Venezuelan citizens, journalists, and AI agents detect, verify, and understand disinformation about Venezuela — starting with the June 2026 earthquake — by providing fast claim verification, a grounded chatbot, and an educational catalog of known fake news patterns.

---

## Users

### Primary Customers

- **Venezuelan citizens:** People who received a claim or message they are unsure about and want a quick, trustworthy answer.
- **Journalists and fact-checkers:** Professionals who need programmatic access to structured verification results and source data.
- **Developers and AI agents:** Teams building tools on top of the same knowledge base via the MCP server interface.

### User Personas

**Concerned Citizen** (25–55)
- **Role:** Resident or diaspora member following the earthquake aftermath
- **Context:** Receives WhatsApp messages and social media posts with unverified claims about casualties, aid, and reconstruction
- **Pain Points:** Cannot tell real from fake quickly; no Spanish-language tool focused on Venezuela; generic fact-checkers lack local context
- **Goals:** Verify a specific claim in under a minute; understand why it was flagged; find official sources to share

**Journalist / Fact-checker** (28–45)
- **Role:** Reporter at a Venezuelan or Latin American outlet, or an independent fact-checker
- **Context:** Needs to process multiple claims under deadline pressure; wants structured output they can cite
- **Pain Points:** Manual source lookup is slow; no API for Venezuelan disinformation data
- **Goals:** Query `verifyClaim` and `getAllPatterns` programmatically; access source metadata for attribution

**AI Developer / MCP Consumer** (25–40)
- **Role:** Developer integrating the platform's knowledge base into an LLM workflow
- **Context:** Building agents that answer questions about Venezuela and need grounded, up-to-date facts
- **Pain Points:** Generic LLMs hallucinate Venezuela-specific facts; no dedicated MCP-compatible knowledge base exists
- **Goals:** Query key facts, patterns, and sources from the same API the frontend uses, via the MCP server

---

## The Problem

### Disinformation Outpaced Verified News During the June 2026 Earthquake

When the earthquake struck Venezuela in June 2026, false claims spread across WhatsApp, X, and Telegram faster than official updates could reach the public. Fabricated videos attributed damage to wrong locations, false casualty figures circulated, and public figures were misquoted. Ordinary citizens had no quick, reliable tool to check claims — especially in Spanish, and especially with Venezuelan context.

**Our Solution:** A purpose-built verification platform grounded in real sources (Observatorio Venezolano de Fake News, Factchequeado, USGS, official government channels) that returns a structured verdict, detected patterns, and source citations within seconds.

---

## Differentiators

### Venezuela-Specific Context

Unlike general fact-checking tools (Snopes, AFP Fact Check), we are built exclusively for Venezuelan content, trained on local disinformation patterns, and integrated with Venezuelan monitoring organizations. This results in higher accuracy for regional claims and Spanish-language nuance.

### Unified Knowledge Base for Humans and AI

Unlike siloed fact-checking sites, the same knowledge base that powers the web portal also exposes an MCP server. AI agents and developers get the same verified data through a type-safe API, not a scraper. This results in consistent, auditable answers across every consumer.

### Transparent Reasoning

Unlike black-box moderation tools, every verification result includes a step-by-step explanation, detected pattern names, and linked official sources. Users understand why a claim was flagged, not just that it was.

---

## Key Features

### Core Features

- **Claim Verification:** Submit any text claim and receive a structured verdict (Verdadero / Falso / Dudoso) with a confidence score, explanation, detected patterns, and source links.
- **Pattern Catalog:** Browse a curated, searchable catalog of known disinformation patterns observed during the earthquake and prior Venezuelan crises.
- **Key Facts Reference:** Access a structured set of verified facts (timeline, official figures, aid status) that ground all verification and chatbot responses.

### Chatbot

- **Earthquake Chatbot:** Ask free-form questions about the earthquake, humanitarian aid, reconstruction, or flagged disinformation and receive answers grounded in verified sources and real-time search results. Sessions persist across page reloads.

### Developer and AI Access

- **oRPC API:** All platform capabilities are exposed as type-safe procedures consumable by the frontend, external clients, and the MCP server — no duplicate logic.
- **MCP Server:** A dedicated `packages/mcp-server` package makes the knowledge base queryable by AI agents that follow the Model Context Protocol.

---

## Success Criteria (MVP)

- `verifyClaim` returns a verdict and explanation for any Spanish-language text input
- At least 6 distinct disinformation patterns are detectable and returned in results
- The chatbot answers earthquake-related questions using verified sources
- The platform is publicly deployed and accessible
- All oRPC procedures are callable from the frontend via the shared type contract
- The MCP server exposes the same knowledge base to AI agents
