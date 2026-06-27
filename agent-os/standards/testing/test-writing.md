## Test-Writing Standards — Portal AntiFake Venezuela

Stack: Bun test runner · oRPC · Drizzle ORM · Turso SQLite · Hono · TypeScript strict

---

### 1. Bun test basics

Test files are `*.test.ts`, colocated next to the source file they test. Run all tests with `bun test`. Import from `bun:test` — no Jest package needed.

```ts
import { describe, it, expect, beforeEach } from 'bun:test';
```

---

### 2. Mock external services

Never make real API calls in tests. Use `mock()` from `bun:test` and centralise reusable factories in `src/test/mocks.ts`.

```ts
// src/test/mocks.ts
import { mock } from 'bun:test';

export const mockAnthropicCreate = mock(async () => ({
  content: [{ type: 'text', text: JSON.stringify({ verdict: 'FAKE', confidence: 0.9 }) }],
}));

export const mockTavilyFetch = mock(async () =>
  Response.json({ results: [{ url: 'https://example.com', content: 'test' }] })
);
```

In each test file:
```ts
import { mockAnthropicCreate } from '../test/mocks';
mock.module('@anthropic-ai/sdk', () => ({ default: class { messages = { create: mockAnthropicCreate } } }));
```

---

### 3. Test oRPC procedures directly

Call procedures as plain functions — no HTTP layer. Import the procedure and invoke `.call(ctx, input)` with a mock context containing an in-memory Drizzle client.

```ts
import { verifyNewsProc } from '../procedures/verify-news';
import { createTestDb } from '../test/db';

it('returns FAKE verdict for known misinformation pattern', async () => {
  const ctx = { db: await createTestDb(), user: { id: 'u1' } };
  const result = await verifyNewsProc.call(ctx, { content: 'Maduro won by 100%' });
  expect(result.verdict).toBe('FAKE');
});
```

---

### 4. In-memory SQLite for DB tests

Use `file::memory:` with Drizzle for fast, isolated integration tests. Run migrations in `beforeEach` so each test starts from a clean schema.

```ts
// src/test/db.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../db/schema';

export async function createTestDb() {
  const client = createClient({ url: 'file::memory:' });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}
```

---

### 5. What to test

**Test:** verdict logic, confidence scoring, pattern matching, chat session creation, source-credibility ranking.

**Skip:** Drizzle query internals, Hono routing boilerplate, raw HTTP status codes.

Aim for tests that catch regressions in the verification pipeline — if the Claude prompt changes and the verdict flips, the test should fail.
