import { z } from 'zod'

export const VerdictSchema = z.object({
  verdict: z.enum(['verdadero', 'falso', 'dudoso']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  patterns: z.array(z.string()),
})

export type Verdict = z.infer<typeof VerdictSchema>
