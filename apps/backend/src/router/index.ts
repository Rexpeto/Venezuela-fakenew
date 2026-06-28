import { os, ORPCError } from '@orpc/server'
import { generateObject, generateText } from 'ai'
import type { ModelMessage } from 'ai'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { KEY_FACTS, PATTERNS, detectPatterns } from '@repo/core'
import { createDb } from '../db/client'
import { claims, chatMessages, chatSessions, sources, verifications } from '../db/schema'
import type { Bindings } from '../types'
import { createLLM } from '../lib/llm'
import { CHAT_SYSTEM, VERIFY_CLAIM_SYSTEM } from '../lib/prompts'
import { VerdictSchema } from '../lib/schemas'
import { searchTavily } from '../lib/tavily'

type Context = { env: Bindings; ip?: string | null }
const pub = os.$context<Context>()

// Cap chat history sent to the LLM to bound token cost
const MAX_HISTORY_TURNS = 20

export const router = {
  verifyClaim: pub
    .input(z.object({
      claim: z.string().min(1).max(2000),
      context: z.string().max(500).optional(),
    }))
    .handler(async ({ input, context: ctx }) => {
      const { env } = ctx
      const db = createDb(env)
      const llm = createLLM(env)

      const tavilyResults = await searchTavily(env.TAVILY_API_KEY, input.claim)
      const searchResultsBlock = tavilyResults.length
        ? tavilyResults
            .map((r, i) =>
              `<result id="${i + 1}"><title>${r.title.slice(0, 100)}</title><snippet>${r.content.slice(0, 250)}</snippet></result>`,
            )
            .join('\n')
        : '<result>No se encontraron fuentes.</result>'

      const { object } = await generateObject({
        model: llm,
        schema: VerdictSchema,
        system: VERIFY_CLAIM_SYSTEM,
        prompt: `<claim>${input.claim}</claim>${input.context ? `\n<additional_context>${input.context}</additional_context>` : ''}

<search_results>
${searchResultsBlock}
</search_results>

Devuelve un veredicto con: verdict (verdadero/falso/dudoso), confidence (0-1), explanation, y patterns detectados.`,
      })

      // Use real Tavily URLs — never LLM-generated ones which may be hallucinated
      const sourceUrls = tavilyResults.map(r => r.url)

      // Merge LLM-detected patterns with deterministic core keyword matcher
      const corePatterns = detectPatterns(input.claim)
      const allPatterns = [...new Set([...object.patterns, ...corePatterns])]

      const claimId = crypto.randomUUID()
      const now = new Date()

      await db.insert(claims).values({
        id: claimId,
        claimText: input.claim,
        context: input.context ?? null,
        userIp: ctx.ip ?? null,
        createdAt: now,
      })

      await db.insert(verifications).values({
        id: crypto.randomUUID(),
        claimId,
        verdict: object.verdict,
        confidence: object.confidence,
        explanation: object.explanation,
        patternsDetected: allPatterns,
        sources: sourceUrls,
        createdAt: now,
      })

      return { ...object, patterns: allPatterns, sources: sourceUrls }
    }),

  getAllPatterns: pub.handler(async () => PATTERNS),

  getKeyFacts: pub.handler(async () => KEY_FACTS),

  getRecentVerifications: pub
    .input(z.object({
      limit: z.number().int().min(1).max(50).optional(),
    }).optional())
    .handler(async ({ input, context: ctx }) => {
      const db = createDb(ctx.env)
      return db
        .select({
          id: verifications.id,
          claimId: verifications.claimId,
          claimText: claims.claimText,
          verdict: verifications.verdict,
          confidence: verifications.confidence,
          explanation: verifications.explanation,
          patternsDetected: verifications.patternsDetected,
          sources: verifications.sources,
          createdAt: verifications.createdAt,
        })
        .from(verifications)
        .innerJoin(claims, eq(claims.id, verifications.claimId))
        .orderBy(desc(verifications.createdAt))
        .limit(input?.limit ?? 10)
    }),

  searchSources: pub
    .input(z.object({
      topic: z.string().min(1).max(500),
      limit: z.number().int().min(1).max(10).optional(),
    }))
    .handler(async ({ input, context: ctx }) => {
      const results = await searchTavily(ctx.env.TAVILY_API_KEY, input.topic, input.limit ?? 5)
      const now = new Date()
      const mapped = results.map(r => ({
        // URL is the natural stable identifier for a search result
        id: r.url,
        url: r.url,
        title: r.title,
        topic: input.topic,
        verified: false as const,
        lastChecked: now,
      }))

      if (mapped.length > 0) {
        const db = createDb(ctx.env)
        await db
          .insert(sources)
          .values(mapped)
          .onConflictDoUpdate({
            target: sources.id,
            set: {
              lastChecked: sql`excluded.last_checked`,
              title: sql`excluded.title`,
              topic: sql`excluded.topic`,
            },
          })
      }

      return mapped
    }),

  chat: pub
    .input(z.object({
      message: z.string().min(1).max(1000),
      sessionId: z.string().optional(),
    }))
    .handler(async ({ input, context: ctx }) => {
      const { env } = ctx
      const db = createDb(env)
      const llm = createLLM(env)
      const now = new Date()

      let sessionId: string

      if (!input.sessionId) {
        sessionId = crypto.randomUUID()
        await db.insert(chatSessions).values({ id: sessionId, startedAt: now })
      } else {
        const existing = await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, input.sessionId))
          .limit(1)
        if (!existing.length) {
          throw new ORPCError('NOT_FOUND', { message: 'Session not found' })
        }
        sessionId = input.sessionId
      }

      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(MAX_HISTORY_TURNS)

      const messages: ModelMessage[] = history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      // Call LLM before saving — if it fails, no orphaned messages are written
      const { text } = await generateText({
        model: llm,
        system: CHAT_SYSTEM,
        messages: [...messages, { role: 'user', content: input.message }],
      })

      const msgId = crypto.randomUUID()
      await db.insert(chatMessages).values({
        id: msgId,
        sessionId,
        role: 'user',
        content: input.message,
        createdAt: now,
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
