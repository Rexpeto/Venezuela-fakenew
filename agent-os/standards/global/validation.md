## Validation — Zod + oRPC

Stack: Bun · Hono · oRPC · Drizzle ORM · Turso SQLite · Cloudflare Workers · TypeScript strict · Zod

---

### 1. Zod schemas are the single source of truth

Define a schema once and derive the TypeScript type from it. Never write a
redundant type alias.

```ts
// good
export const ClaimSchema = z.object({
  text: z.string().min(1).max(2000).trim(),
  topic: z.string().min(1).max(200).trim(),
});
export type Claim = z.infer<typeof ClaimSchema>;

// bad — duplicates the schema information
export type Claim = { text: string; topic: string };
```

---

### 2. Every oRPC procedure must declare `.input()` and `.output()`

oRPC validates at runtime; TypeScript enforces at compile time. Both are
required — omitting `.output()` hides bugs from callers.

```ts
export const verifyClaim = publicProcedure
  .input(ClaimSchema)
  .output(VerificationResultSchema)
  .handler(async ({ input }) => {
    // input is fully typed and already validated
  });
```

---

### 3. Always constrain string inputs

Every user-supplied string field needs `.min()`, `.max()`, and `.trim()`.

| Field       | max chars |
|-------------|-----------|
| claim text  | 2 000     |
| topic       | 200       |
| url         | 2 048     |

```ts
const text  = z.string().min(1).max(2000).trim();
const topic = z.string().min(1).max(200).trim();
const url   = z.string().url().max(2048);
```

---

### 4. Schema co-location

- Keep a procedure's input/output schemas **in the same file** as the procedure.
- Schemas shared across procedures live in `packages/core/schemas.ts`.

```ts
// packages/core/schemas.ts
export const VerificationResultSchema = z.object({
  verdict: z.enum(["true", "false", "unverified"]),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string().url()),
  summary: z.string().max(500),
});
```

---

### 5. Never trust external data — always parse with `.safeParse()`

Parse Claude API responses and Tavily search results through a Zod schema
before accessing any field. Use `.safeParse()` and handle failures explicitly.

```ts
const raw = await claudeClient.complete(prompt);
const result = ClaudeResponseSchema.safeParse(raw);
if (!result.success) {
  throw new ExternalParseError("Claude response invalid", result.error);
}
const { verdict, summary } = result.data; // safe to use
```
