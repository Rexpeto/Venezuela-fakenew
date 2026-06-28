import { os } from '@orpc/server'
import { z } from 'zod'
import { generateObject, generateText } from 'ai'
import type { ModelMessage } from 'ai'
import { eq, asc } from 'drizzle-orm'
import { PATTERNS, KEY_FACTS } from '@repo/core'
import { createDb } from '../db/client'
import { createLLM } from '../lib/llm'
import { searchTavily } from '../lib/tavily'
import { claims, verifications, chatSessions, chatMessages } from '../db/schema'
import type { Bindings } from '../types'

type Context = { env: Bindings }
const pub = os.$context<Context>()

const VerdictSchema = z.object({
  verdict: z.enum(['verdadero', 'falso', 'dudoso']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  patterns: z.array(z.string()),
  sources: z.array(z.string()),
})

export const router = {
  verifyClaim: pub
    .input(z.object({ claim: z.string().min(1), context: z.string().optional() }))
    .handler(async ({ input, context: ctx }) => {
      const { env } = ctx
      const db = createDb(env)
      const llm = createLLM(env)

      const tavilyResults = await searchTavily(env.TAVILY_API_KEY, input.claim)
      const sourceSummary = tavilyResults
        .map((r, i) => `[${i + 1}] ${r.title}: ${r.content.slice(0, 300)}`)
        .join('\n')

      const { object } = await generateObject({
        model: llm,
        schema: VerdictSchema,
        system: `Eres un verificador de noticias para Portal AntiFake Venezuela.
Contexto: En junio 2026 ocurrió un terremoto de magnitud 6.2 en Venezuela.
Analiza el claim con base en las fuentes proporcionadas y devuelve un veredicto fundamentado.
Patrones de desinformación conocidos: exageración de cifras, atribución falsa, descontextualización, noticias antiguas presentadas como recientes.`,
        prompt: `Claim: "${input.claim}"${input.context ? `\nContexto adicional: ${input.context}` : ''}

Fuentes encontradas:
${sourceSummary || 'No se encontraron fuentes.'}

Devuelve un veredicto con: verdict (verdadero/falso/dudoso), confidence (0-1), explanation, patterns detectados, y sources (URLs).`,
      })

      const claimId = crypto.randomUUID()
      const now = new Date()

      await db.insert(claims).values({
        id: claimId,
        claimText: input.claim,
        context: input.context ?? null,
        createdAt: now,
      })

      await db.insert(verifications).values({
        id: crypto.randomUUID(),
        claimId,
        verdict: object.verdict,
        confidence: object.confidence,
        explanation: object.explanation,
        patternsDetected: object.patterns,
        sources: tavilyResults.map(r => r.url),
        createdAt: now,
      })

      return object
    }),

  getAllPatterns: pub.handler(async () => PATTERNS),

  getKeyFacts: pub.handler(async () => KEY_FACTS),

  searchSources: pub
    .input(z.object({ topic: z.string().min(1), limit: z.number().int().positive().optional() }))
    .handler(async ({ input, context: ctx }) => {
      const results = await searchTavily(ctx.env.TAVILY_API_KEY, input.topic, input.limit ?? 5)
      return results.map(r => ({
        id: crypto.randomUUID(),
        url: r.url,
        title: r.title,
        topic: input.topic,
        verified: false as const,
        lastChecked: new Date(),
      }))
    }),

  chat: pub
    .input(z.object({ message: z.string().min(1), sessionId: z.string().optional() }))
    .handler(async ({ input, context: ctx }) => {
      const { env } = ctx
      const db = createDb(env)
      const llm = createLLM(env)
      const now = new Date()

      let sessionId = input.sessionId
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        await db.insert(chatSessions).values({ id: sessionId, startedAt: now })
      } else {
        const existing = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, sessionId))
          .limit(1)
        if (!existing.length) {
          await db.insert(chatSessions).values({ id: sessionId, startedAt: now })
        }
      }

      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt))

      const messages: ModelMessage[] = history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      await db.insert(chatMessages).values({
        id: crypto.randomUUID(),
        sessionId,
        role: 'user',
        content: input.message,
        createdAt: now,
      })

      const { text } = await generateText({
        model: llm,
        system: `Eres un asistente del Portal AntiFake Venezuela.
Contexto: En junio 2026 ocurrió un terremoto de magnitud 6.2 en Venezuela. Tu misión es ayudar a los usuarios a identificar desinformación sobre el sismo.
Responde en español, con tono claro y empático. Si detectas que un mensaje puede contener información falsa o dudosa, señálalo con evidencia.`,
        messages: [...messages, { role: 'user', content: input.message }],
      })

      await db.insert(chatMessages).values({
        id: crypto.randomUUID(),
        sessionId,
        role: 'assistant',
        content: text,
        createdAt: new Date(),
      })

      return { reply: text, sessionId }
    }),
}
