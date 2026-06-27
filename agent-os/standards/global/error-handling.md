# Error Handling Standards

Stack: Bun · Hono · oRPC · Drizzle ORM · Turso SQLite · Cloudflare Workers · TypeScript strict

---

## 1. Always throw `ORPCError` inside oRPC procedures

Never throw plain `Error` from a procedure. Use `ORPCError` from `@orpc/server` with the appropriate code.

```ts
import { ORPCError } from '@orpc/server'

// Good
throw new ORPCError('NOT_FOUND', { message: 'Claim not found' })
throw new ORPCError('BAD_REQUEST', { message: 'URL is required' })
throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Unexpected failure' })

// Bad — never do this inside a procedure
throw new Error('Claim not found')
```

Common codes: `NOT_FOUND`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `INTERNAL_SERVER_ERROR`.

---

## 2. Hono global error middleware

Register `app.onError()` once at the top level. Log the full error server-side; send a sanitized JSON body to the client — no stack traces.

```ts
app.onError((err, c) => {
  console.error('[unhandled]', err)
  const status = err instanceof ORPCError ? err.status : 500
  return c.json({ error: 'An unexpected error occurred' }, status)
})
```

---

## 3. Wrap external service calls (Claude API, Tavily, etc.)

Catch at the call site, log the original error, and re-throw as `ORPCError`.

```ts
async function fetchTavilyResults(query: string) {
  try {
    return await tavily.search(query)
  } catch (cause) {
    console.error('[tavily] search failed', cause)
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Search service unavailable. Please try again.',
      cause,
    })
  }
}
```

Same pattern applies to Claude API calls and any Turso queries that can fail at the network level.

---

## 4. Never swallow errors silently

Every `catch` block must do at least one of: re-throw, return a typed error response, or log and handle explicitly. An empty or comment-only catch is a bug.

```ts
// Good — re-throw with context
} catch (err) {
  console.error('[db] insert claim failed', err)
  throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Could not save claim', cause: err })
}

// Bad — silent swallow
} catch (_) {}
```

---

## 5. Result types for expected failures

For domain-level outcomes that are not exceptional (e.g. "claim already verified", "duplicate URL"), use a discriminated union instead of throwing.

```ts
type VerifyResult =
  | { status: 'verified'; data: VerificationData }
  | { status: 'duplicate'; existingId: string }
  | { status: 'insufficient_sources' }

// Caller pattern — no try/catch needed for expected branches
const result = await verifyClaim(input)
if (result.status === 'duplicate') {
  throw new ORPCError('CONFLICT', { message: 'This claim was already verified', data: result })
}
```

Reserve exceptions for truly unexpected failures; use result types for predictable business outcomes.
