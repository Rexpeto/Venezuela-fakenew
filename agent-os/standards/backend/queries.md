# Drizzle Query Standards — Portal AntiFake Venezuela

## 1. Client Setup

Create the Drizzle client once per Worker request. CF Workers are stateless — no module-level singletons.

```ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export function createDb(env: Env) {
  const client = createClient({ url: env.TURSO_URL, authToken: env.TURSO_TOKEN });
  return drizzle(client, { schema });
}
```

Call `createDb(env)` at the top of each request handler (e.g. in the oRPC middleware context).

## 2. Prefer Query Builder over Raw SQL

Use `db.select().from().where()` for all CRUD. Reserve `db.run(sql`...`)` for DDL or queries the builder cannot express.

```ts
// Good
const news = await db.select().from(articles).where(eq(articles.status, "pending"));

// Only for DDL / complex expressions
await db.run(sql`CREATE INDEX IF NOT EXISTS idx_url ON articles (url)`);
```

## 3. Prepared Statements for Hot Paths

Use `.prepare()` on queries that run on every verification save or lookup. Name them descriptively.

```ts
const insertVerification = db
  .insert(verifications)
  .values({ articleId: sql.placeholder("articleId"), verdict: sql.placeholder("verdict") })
  .prepare("insertVerification");

await insertVerification.execute({ articleId: id, verdict: "fake" });
```

## 4. Avoid N+1 Queries

Never query inside a loop. Use joins or batch with `inArray`.

```ts
// Bad — N+1
for (const a of articles) {
  const v = await db.select().from(verifications).where(eq(verifications.articleId, a.id));
}

// Good — single query with join
const result = await db
  .select()
  .from(articles)
  .leftJoin(verifications, eq(verifications.articleId, articles.id))
  .where(inArray(articles.id, ids));
```

## 5. Type-Safe Results via Relational API

Use `db.query.<table>.findMany()` for nested relations — it returns fully typed objects without manual joins.

```ts
const articles = await db.query.articles.findMany({
  where: eq(schema.articles.status, "pending"),
  with: { verifications: true },
});
// articles[0].verifications is typed as Verification[]
```

Destructure from Drizzle's inferred types; never cast with `as any`.
