import { os } from '@orpc/server'
import { z } from 'zod'
import { PATTERNS, KEY_FACTS } from '@repo/core'

const pub = os

export const router = {
  verifyClaim: pub
    .input(z.object({ claim: z.string(), context: z.string().optional() }))
    .handler(async () => ({
      verdict: 'dudoso' as const,
      confidence: 0,
      explanation: '',
      patterns: [] as string[],
      sources: [] as string[],
    })),

  getAllPatterns: pub.handler(async () => PATTERNS),

  getKeyFacts: pub.handler(async () => KEY_FACTS),

  searchSources: pub
    .input(z.object({ topic: z.string(), limit: z.number().optional() }))
    .handler(async () => []),

  chat: pub
    .input(z.object({ message: z.string(), sessionId: z.string().optional() }))
    .handler(async ({ input }) => ({
      reply: '',
      sessionId: input.sessionId ?? '',
    })),
}