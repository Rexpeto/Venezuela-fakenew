# AI Integration Standards — Claude API on Cloudflare Workers

**Stack:** `@anthropic-ai/sdk` · `claude-sonnet-4-6` · Hono · Cloudflare Workers

---

## 1. Client Instantiation

Create the `Anthropic` client **inside the request handler**, never at module level.
Cloudflare Workers have no module-level async init and `env` is only available per-request.

```ts
// src/ai/client.ts
import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../types';

export function createAIClient(env: Env): Anthropic {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}
```

```ts
// inside a Hono handler
app.post('/verify', async (c) => {
  const client = createAIClient(c.env); // per-request, key from env binding
  // ...
});
```

Never hardcode the key. Always source it from `env.ANTHROPIC_API_KEY` (set in `wrangler.toml` secrets).

---

## 2. System Prompts

Define all system prompts as typed constants in `src/ai/prompts.ts`.
Each prompt must declare: role, earthquake context, output format, and language.

```ts
// src/ai/prompts.ts

/** For claim verdict endpoint — structured JSON output in English */
export const CLAIM_VERIFICATION_SYSTEM = `You are a fact-checking assistant for Portal AntiFake Venezuela.
Context: A 6.2-magnitude earthquake struck Venezuela in June 2026. Misinformation is spreading rapidly.
Your role is to evaluate claims about the earthquake and its aftermath.

Respond ONLY with a valid JSON object matching the schema provided.
Language: English (for structured output fields).` as const;

/** For /chat endpoint — conversational, user-facing Spanish */
export const CHATBOT_SYSTEM = `Eres un asistente de verificación de noticias del Portal AntiFake Venezuela.
Contexto: En junio de 2026 ocurrió un terremoto de magnitud 6.2 en Venezuela.
Tu misión es ayudar a los usuarios a identificar desinformación sobre el sismo y sus consecuencias.
Responde siempre en español, con un tono claro y empático.` as const;
```

---

## 3. Structured Output for Claim Verdicts

Use Claude's tool use to get reliable JSON back. Define the schema with Zod and validate
with `.safeParse()`. Never trust raw text responses for structured data.

```ts
// src/ai/schemas.ts
import { z } from 'zod';

export const VerdictSchema = z.object({
  verdict: z.enum(['true', 'false', 'misleading', 'unverifiable']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  sources: z.array(z.string()).optional(),
});

export type Verdict = z.infer<typeof VerdictSchema>;
```

```ts
// src/ai/verify.ts
import { VerdictSchema, type Verdict } from './schemas';
import { CLAIM_VERIFICATION_SYSTEM } from './prompts';

export async function verifyClaim(
  client: Anthropic,
  claim: string,
): Promise<Verdict | null> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: CLAIM_VERIFICATION_SYSTEM,
    tools: [{
      name: 'submit_verdict',
      description: 'Submit the fact-check verdict for a claim',
      input_schema: {
        type: 'object' as const,
        properties: {
          verdict: { type: 'string', enum: ['true', 'false', 'misleading', 'unverifiable'] },
          confidence: { type: 'number' },
          explanation: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['verdict', 'confidence', 'explanation'],
      },
    }],
    tool_choice: { type: 'tool', name: 'submit_verdict' },
    messages: [{ role: 'user', content: `Evaluate this claim: "${claim}"` }],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') return null;

  const parsed = VerdictSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.error('Verdict parse failed:', parsed.error.flatten());
    return null;
  }
  return parsed.data;
}
```

---

## 4. Streaming for Chat

Use `client.messages.stream()` for `/chat`. Pipe through Hono's `streamText()`.
Never buffer a full LLM response before sending — this causes timeouts on Workers.

```ts
// src/routes/chat.ts
import { streamText } from 'hono/streaming';
import { CHATBOT_SYSTEM } from '../ai/prompts';

app.post('/chat', async (c) => {
  const { messages } = await c.req.json();
  const client = createAIClient(c.env);

  return streamText(c, async (stream) => {
    const aiStream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: CHATBOT_SYSTEM,
      messages,
    });

    for await (const event of aiStream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        await stream.write(event.delta.text);
      }
    }
  });
});
```

---

## 5. Token and Cost Control

Set `max_tokens` explicitly on every call. Cache Tavily search results per claim
to avoid redundant searches and LLM calls.

| Endpoint    | `max_tokens` | Rationale                          |
|-------------|--------------|------------------------------------|
| `/verify`   | `1024`       | Structured JSON verdict; brief     |
| `/chat`     | `2048`       | Conversational, may need detail    |

```ts
// src/ai/cache.ts — simple KV-backed search cache
export async function getCachedSearch(
  kv: KVNamespace,
  claimHash: string,
): Promise<string | null> {
  return kv.get(`search:${claimHash}`);
}

export async function setCachedSearch(
  kv: KVNamespace,
  claimHash: string,
  result: string,
  ttlSeconds = 3600,
): Promise<void> {
  await kv.put(`search:${claimHash}`, result, { expirationTtl: ttlSeconds });
}
```

Use a deterministic hash of the normalized claim text as the cache key.
Only include context directly relevant to the claim in each LLM call —
avoid sending unrelated conversation history to the verification endpoint.
