## Drizzle + Turso Migration Best Practices

### 1. Migration Workflow

Use `bunx drizzle-kit generate` to generate SQL migration files from schema changes,
then `bunx drizzle-kit migrate` to apply them.

- Never manually edit generated migration files in `drizzle/`
- Review the generated SQL before applying to any remote database
- One logical change per migration keeps history readable and rollbacks scoped

### 2. drizzle.config.ts Setup

```ts
// drizzle.config.ts
export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- `authToken` is optional when `url` points to a local file (`file:local.db`)
- Keep credentials in `.env`; never hardcode them

### 3. Local Dev vs Production

- Set `TURSO_URL=file:local.db` locally; the libsql driver handles local SQLite files natively
- Production uses a `libsql://...` remote URL with an auth token
- Always run `bunx drizzle-kit generate` and review the SQL diff before running
  `bunx drizzle-kit migrate` against the production Turso DB

### 4. Schema Changes

- Add new columns as **nullable** or with a **`default` value** — SQLite rejects `NOT NULL`
  columns added to existing tables without a default
- Never drop a column without a deprecation period; mark it unused in the schema first,
  deploy, then drop in a follow-up migration
- SQLite has limited `ALTER TABLE` support; Drizzle generates table-recreation workarounds
  automatically — do not fight the generated SQL

### 5. Migration Files in Version Control

- The `drizzle/` folder **is committed** to git alongside application code
- Each migration file is **immutable once applied**; treat it like a published event
- To fix a bad migration: write a new corrective migration — never edit an applied file
- The `drizzle/meta/_journal.json` file tracks applied migrations; commit it too
