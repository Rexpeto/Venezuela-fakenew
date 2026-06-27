## API layer standards — oRPC + Hono (Portal AntiFake Venezuela)

### 1. Router structure

Group procedures by domain using `os.router({})`. One router file per domain;
compose all domain routers into a single root router.

```ts
// routers/verification.ts
export const verificationRouter = os.router({
  verifyClaim,
  getAllPatterns,
  getKeyFacts,
  searchSources,
});

// routers/chat.ts
export const chatRouter = os.router({ chat });

// routers/index.ts  (root)
export const appRouter = os.router({
  verification: verificationRouter,
  chat: chatRouter,
});
export type AppRouter = typeof appRouter;
```

### 2. Hono adapter wiring

Mount oRPC on Hono via `@orpc/server/hono`. Apply CORS before the oRPC handler
so preflight requests are answered at the HTTP layer.

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createHonoHandler } from '@orpc/server/hono';
import { appRouter } from './routers';

const app = new Hono<{ Bindings: Env }>();

app.use('/rpc/*', cors({ origin: '*' }));

app.use('/rpc/*', (c) =>
  createHonoHandler({
    router: appRouter,
    context: { db: createDb(c.env.DATABASE_URL), env: c.env },
  })(c.req.raw)
);

export default app;
```

### 3. Middleware placement

Use oRPC `.use()` for cross-cutting concerns (logging, auth, rate limiting).
Reserve Hono middleware only for pure HTTP-level concerns (CORS, static assets).

```ts
// oRPC middleware — applied per-procedure or on the base instance
const loggedProcedure = os.use(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  console.log(`[oRPC] ${path} — ${Date.now() - start}ms`);
  return result;
});

// Use the logged base for every procedure in this domain
export const verifyClaim = loggedProcedure
  .input(z.object({ claim: z.string() }))
  .handler(async ({ input, ctx }) => { /* ... */ });
```

### 4. Typed context

Define a typed `Context` interface; populate it in the Hono adapter call (see §2).
Every procedure receives `ctx` fully typed — no casting required.

```ts
// context.ts
export interface Context {
  db: ReturnType<typeof createDb>;   // Drizzle client
  env: Env;                          // Cloudflare Workers bindings
}

// Initialise the oRPC base with the context type
import { os } from '@orpc/server';
export const base = os.$context<Context>();
```

### 5. Procedure naming

Use camelCase verbs. Procedures are **actions**, not resources.

| Good             | Bad                  |
|------------------|----------------------|
| `verifyClaim`    | `verify_claim`       |
| `getAllPatterns`  | `GetAllPatterns`     |
| `searchSources`  | `sources` (noun)     |
| `chat`           | `chatMessage`        |
