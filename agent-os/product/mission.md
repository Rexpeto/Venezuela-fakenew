# Product Mission

## Pitch

Portal AntiFake Venezuela is a public web platform that helps Venezuelan citizens, journalists, and AI agents detect, verify, and understand disinformation about Venezuela — starting with the June 2026 earthquake — by providing fast claim verification, a grounded chatbot, and an educational catalog of known fake news patterns.

---

## Users

- **Venezuelan citizens:** People who received a claim or message they are unsure about and want a quick, trustworthy answer.
- **Journalists and fact-checkers:** Professionals who need structured verification results and source data.
- **Developers and AI agents:** Teams consuming the same knowledge base via the MCP server interface.

---

## The Problem

### Disinformation Outpaced Verified News During the June 2026 Earthquake

When the earthquake struck Venezuela in June 2026, false claims spread across WhatsApp, X, and Telegram faster than official updates could reach the public. Fabricated videos attributed damage to wrong locations, false casualty figures circulated, and public figures were misquoted. Ordinary citizens had no quick, reliable tool to check claims — especially in Spanish, and especially with Venezuelan context.

**Our Solution:** A purpose-built verification platform grounded in real sources (Observatorio Venezolano de Fake News, Factchequeado, USGS, official government channels) that returns a structured verdict, detected patterns, and source citations within seconds.

---

## Key Features

### Core Features

- **Claim Verification:** Submit any text claim and receive a structured verdict (Verdadero / Falso / Dudoso) with a confidence score, explanation, detected patterns, and source links.
- **Pattern Catalog:** Browse a curated, searchable catalog of known disinformation patterns observed during the earthquake and prior Venezuelan crises.
- **Key Facts Reference:** Access a structured set of verified facts (timeline, official figures, aid status) that ground all verification and chatbot responses.

### Chatbot

- **Earthquake Chatbot:** Ask free-form questions about the earthquake, humanitarian aid, reconstruction, or flagged disinformation and receive answers grounded in verified sources and real-time search results. Sessions persist across page reloads.

---

## Success Criteria (MVP)

- `verifyClaim` returns a verdict and explanation for any Spanish-language text input
- At least 6 distinct disinformation patterns are detectable and returned in results
- The chatbot answers earthquake-related questions using verified sources
- The platform is publicly deployed and accessible
- All oRPC procedures are callable from the frontend via the shared type contract
- The MCP server exposes the same knowledge base to AI agents
