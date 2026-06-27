# Conventions — Portal AntiFake Venezuela

## 1. File Naming

- **Files and directories:** kebab-case — `verify-claim.ts`, `key-facts.ts`, `search-sources.ts`
- **Classes and types:** PascalCase — `VerifyClaimInput`, `PatternMatch`, `KeyFact`
- **Functions and variables:** camelCase — `verifyClaim`, `getAllPatterns`, `sourceList`
- Test files mirror the source file: `verify-claim.test.ts` lives next to `verify-claim.ts`

## 2. Folder Structure

```
apps/api/
  src/
    procedures/       # one file per oRPC procedure
    router.ts         # assembles all procedures into the router
    index.ts          # Hono app + Cloudflare Workers entry point

packages/core/
  src/
    types/            # shared TypeScript types and Zod schemas
    patterns/         # fake-news pattern definitions
    facts/            # key-fact data and lookup helpers
    utils/            # pure utility functions used across packages
  index.ts            # single barrel export for the package
```

## 3. Export Patterns

- Prefer **named exports** everywhere — no default exports except at the Cloudflare Workers entry point (`export default app`).
- One concept per file: a file that exports `verifyClaim` should not also export unrelated helpers.
- Barrel `index.ts` files are allowed **only at package boundaries** (`packages/core/index.ts`). Do not create `index.ts` barrels inside feature folders within the API.

## 4. `packages/core` Boundary

**Belongs in `packages/core`:**
- Shared TypeScript types and Zod schemas used by both the API and any future consumers
- Pattern definitions and matching logic (the patterns themselves, not the HTTP procedure)
- Key-fact data structures and lookup helpers
- Pure utility functions with no runtime dependencies on Hono or Cloudflare APIs

**Stays in `apps/api`:**
- oRPC procedure definitions (`verifyClaim`, `chat`, etc.)
- Route wiring and middleware
- Cloudflare Workers bindings and environment types
- Any logic that depends on request context or `c.env`

## 5. Procedure File Naming

Each oRPC procedure lives in its own file under `src/procedures/`, named after the procedure in kebab-case:

```
src/procedures/
  verify-claim.ts      # exports verifyClaimProcedure
  get-all-patterns.ts  # exports getAllPatternsProcedure
  get-key-facts.ts     # exports getKeyFactsProcedure
  search-sources.ts    # exports searchSourcesProcedure
  chat.ts              # exports chatProcedure
```

Each file exports exactly one procedure constant. The procedure's input/output schemas come from `packages/core/types/`.
