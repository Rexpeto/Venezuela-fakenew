# TypeScript Coding Style — Portal AntiFake Venezuela

Stack: Bun · Hono · oRPC · Drizzle ORM · Turso · Cloudflare Workers · TypeScript strict

---

## 1. TypeScript Strict Mode

Enable the full strict suite in `tsconfig.json`. Beyond `"strict": true`, add:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // arr[0] is T | undefined, not T
    "exactOptionalPropertyTypes": true, // { a?: string } ≠ { a?: string | undefined }
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

`noUncheckedIndexedAccess` is the most impactful: it forces you to handle missing
array/map entries rather than assuming they exist.

---

## 2. Bun-Native APIs Over Node Shims

Prefer Bun built-ins; avoid pulling in Node compat layers that add overhead or
behave differently on Workers.

```ts
// Read a file
const text = await Bun.file("./data/sources.json").text();

// Environment variables — Bun.env is the canonical source
const apiKey = Bun.env.CLAUDE_API_KEY ?? throwMissing("CLAUDE_API_KEY");

// Hash / crypto
const hash = Bun.hash(rawText);
```

Never use `process.env` directly — it skips Bun's dotenv loading and is a
footgun in Workers where `process` may be a polyfill.

---

## 3. ESM Imports — Always Use `.js` Extension

TypeScript resolves `.ts` → `.js` at emit time. Write the output extension in
every relative import so both `tsc` and Bun agree:

```ts
// Correct — works with "moduleResolution": "bundler" | "node16" | "nodenext"
import { detectFakeNews } from "./services/detection.js";
import type { ArticleRow } from "../db/schema.js";

// Wrong — breaks under native ESM and Workers bundlers
import { detectFakeNews } from "./services/detection";
```

Never use `require()` or `module.exports`. The project is pure ESM.

---

## 4. Infer Types, Annotate Only at Boundaries

Let the compiler infer local variables, array/object literals, and
implementation details. Annotate explicitly only at public API boundaries
(function parameters, exported function return types, oRPC procedure
inputs/outputs).

```ts
// Infer locals — no annotation needed
const score = computeScore(article);
const sources = await fetchSources(query);

// Annotate boundaries
export async function analyzeArticle(
  input: AnalyzeInput,
): Promise<AnalysisResult> {
  const raw = await callClaude(input.text); // inferred
  return parseResult(raw);                  // inferred
}
```

Avoid redundant annotations like `const x: string = "hello"` — they add noise
without safety.

---

## 5. Never Use `any` — Narrow `unknown` Instead

`any` disables type checking for everything it touches. Use `unknown` at trust
boundaries (API responses, user input, external data) and narrow with guards or
schema parsers.

```ts
// Wrong
function parseResponse(data: any) {
  return data.result.score as number; // silent runtime bomb
}

// Correct — use a Zod schema at the boundary
import { z } from "zod";

const ClaudeResponse = z.object({ score: z.number(), label: z.string() });

function parseResponse(data: unknown) {
  return ClaudeResponse.parse(data); // throws with a clear message on mismatch
}
```

For all external API responses (Claude, Tavily), define Zod schemas and call
`.parse()` — never cast with `as SomeType` without prior validation.

ESLint rule to enforce: `@typescript-eslint/no-explicit-any: "error"`.
