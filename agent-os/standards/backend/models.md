## Drizzle Schema Best Practices (Turso/SQLite)

### 1. Schema file location

All tables live in `src/db/schema.ts` and are exported from there. Import inferred
types at the call site — never define separate interface duplicates.

```ts
// src/db/schema.ts
export { claims, verifications, chatSessions, chatMessages, sources }

// elsewhere
import { claims } from '@/db/schema'
type Claim       = typeof claims.$inferSelect
type NewClaim    = typeof claims.$inferInsert
```

### 2. SQLite column types

Use only the four native SQLite affinities: `text`, `integer`, `real`, `blob`.
JSON arrays (`patterns_detected`, `sources`) must be stored as `text` and
explicitly serialised/deserialised — never passed as raw objects.

```ts
patternsDetected: text('patterns_detected').notNull()
  .$defaultFn(() => '[]'),
// insert:  JSON.stringify(patterns)
// select:  JSON.parse(row.patternsDetected) as string[]
```

### 3. Primary keys

Always use a `text` UUID primary key. Generate it at insert time with
`crypto.randomUUID()`, which is available in Cloudflare Workers without imports.

```ts
id: text('id').primaryKey()
  .$defaultFn(() => crypto.randomUUID()),
```

### 4. Timestamps

Use `integer` in `timestamp` mode for Unix timestamps. Set the default with
`$defaultFn` so every insert gets a value automatically.

```ts
createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  .$defaultFn(() => new Date()),
```

### 5. Relations

Declare Drizzle `relations()` for every association so joins are type-safe.
Always write the foreign key reference explicitly with `references()`.

```ts
import { relations } from 'drizzle-orm'

export const verificationsRelations = relations(verifications, ({ one }) => ({
  claim: one(claims, {
    fields:     [verifications.claimId],
    references: [claims.id],
  }),
}))

// column definition
claimId: text('claim_id').notNull()
  .references(() => claims.id),
```
