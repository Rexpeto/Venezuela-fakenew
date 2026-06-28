## AI Integration Standards — Vercel AI SDK on Cloudflare Workers

**Stack:** `ai` · `@ai-sdk/openai` · Hono · Cloudflare Workers
**Provider:** OpenAI-compatible (OpenAI, HuggingFace Inference, Groq — swap via env vars, no code change)

---

### 1. LLM Client

Create the model instance **inside the request handler** via `createLLM(env)`. Never at module level — `env` is only available per-request on CF Workers.

```ts
// src/lib/llm.ts
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

type LLMEnv = {
  LLM_API_KEY: string
  LLM_BASE_URL?: string  // omit for OpenAI; set for HuggingFace/Groq
  LLM_MODEL?: string     // default: 'gpt-4o-mini'
}

export function createLLM(env: LLMEnv): LanguageModel {
  const provider = createOpenAI({
    apiKey: env.LLM_API_KEY,
    ...(env.LLM_BASE_URL ? { baseURL: env.LLM_BASE_URL } : {}),
  })
  return provider(env.LLM_MODEL ?? 'gpt-4o-mini')
}
```

**CF Workers gotcha:** Never use the bare `openai()` default export — it reads `process.env`, which doesn't exist on Workers. Always use `createOpenAI({ apiKey: env.LLM_API_KEY })`.

---

### 2. Switching Providers

Change only Cloudflare secrets — zero code changes required:

| Provider | `LLM_BASE_URL` | `LLM_MODEL` example |
|---|---|---|
| OpenAI (default) | _(unset)_ | `gpt-4o-mini` |
| HuggingFace | `https://api-inference.huggingface.co/v1` | `meta-llama/Llama-3.1-8B-Instruct` |
| Groq | `https://api.groq.com/openai/v1` | `llama3-8b-8192` |

---

### 3. Structured Output (`verifyClaim`)

Use `generateObject` with a Zod schema. The SDK enforces the schema — no manual JSON parsing.

```ts
import { generateObject } from 'ai'
import { z } from 'zod'
import { createLLM } from '../lib/llm'

const VerdictSchema = z.object({
  verdict: z.enum(['verdadero', 'falso', 'dudoso']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  patterns: z.array(z.string()),
  sources: z.array(z.string()),
})

// inside oRPC handler
const model = createLLM(ctx.env)
const { object } = await generateObject({
  model,
  schema: VerdictSchema,
  system: 'You are a fact-checker for Portal AntiFake Venezuela...',
  prompt: `Evaluate this claim: "${input.claim}"`,
})
// object is fully typed as z.infer<typeof VerdictSchema>
```

---

### 4. Chat (`generateText`)

Use `generateText` for the chatbot. Load history from Turso, append new message, call the model, persist both turns.

```ts
import { generateText } from 'ai'
import { createLLM } from '../lib/llm'

const model = createLLM(ctx.env)
const { text } = await generateText({
  model,
  system: 'Eres un asistente de verificación del Portal AntiFake Venezuela...',
  messages: [
    ...history,  // CoreMessage[] loaded from chat_messages table
    { role: 'user', content: input.message },
  ],
})
```

---

### 5. Env Bindings

Add to `Bindings` in `src/index.ts` and declare in `wrangler.toml`:

```ts
type Bindings = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  LLM_API_KEY: string
  LLM_BASE_URL?: string
  LLM_MODEL?: string
  TAVILY_API_KEY: string
}
```

Set secrets with: `bunx wrangler secret put LLM_API_KEY`
