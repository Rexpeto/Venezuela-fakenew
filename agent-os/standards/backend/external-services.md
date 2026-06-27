# External Services Integration Standards

Tech stack: Bun · Hono · oRPC · Cloudflare Workers · TypeScript strict

---

## 1. API Keys from CF Workers Env Bindings

Never use `process.env` or hardcode secrets. Always read from the CF Workers `Env` object.

**`wrangler.toml`**
```toml
[vars]
TAVILY_API_KEY = ""        # set via `wrangler secret put TAVILY_API_KEY`
ANTHROPIC_API_KEY = ""     # set via `wrangler secret put ANTHROPIC_API_KEY`
```

**`src/types/env.ts`**
```ts
export interface Env {
  TAVILY_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  DB: D1Database;
}
```

Access in handlers: `c.env.TAVILY_API_KEY` — never from global scope.

---

## 2. Tavily Search Pattern with Zod Validation

Parse all external responses through a Zod schema before trusting any field.

```ts
import { z } from 'zod';

const TavilyResultSchema = z.object({
  results: z.array(z.object({
    url: z.string().url(),
    content: z.string(),
    score: z.number(),
  })),
});

async function searchTavily(query: string, apiKey: string) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}`);
  return TavilyResultSchema.parse(await res.json());
}
```

---

## 3. Fallback When Tavily is Unavailable

If Tavily returns non-200 or times out, log and continue with reduced confidence.
Do not fail the whole request; mark sources as `verified: false`.

```ts
let sources: Source[] = [];
try {
  const data = await searchTavily(query, env.TAVILY_API_KEY);
  sources = data.results.map(r => ({ ...r, verified: true }));
} catch (err) {
  console.error('[tavily] search failed, continuing unverified:', err);
  sources = [{ url: '', content: '', score: 0, verified: false }];
}
```

---

## 4. Timeout Every External `fetch()` Call

CF Workers have a ~30s wall-clock limit but only ~10s CPU time.
Always use `AbortSignal.timeout(8000)` on every outbound request to leave headroom.

```ts
// Good
fetch(url, { signal: AbortSignal.timeout(8000) });

// Bad — no timeout, can hang until Worker is killed
fetch(url);
```

Apply to Tavily, Claude API, and any other outbound call.

---

## 5. Never Call External Services in Loops — Batch and Cache

- Deduplicate queries before sending to Tavily.
- Cache results in the `sources` DB table keyed by `query` (normalize to lowercase trimmed).
- If a cached row exists and is less than 24 hours old, return it without a network call.

```ts
// Deduplicate before fetching
const uniqueQueries = [...new Set(claims.map(c => c.normalizedQuery))];

// Check cache first
const cached = await db.select().from(sources)
  .where(and(eq(sources.query, query), gte(sources.fetchedAt, oneDayAgo)));
if (cached.length > 0) return cached;

// Only fetch from Tavily on cache miss
const fresh = await searchTavily(query, env.TAVILY_API_KEY);
await db.insert(sources).values({ query, results: fresh, fetchedAt: new Date() });
```
