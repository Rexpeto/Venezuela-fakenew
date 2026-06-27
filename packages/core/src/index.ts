export type Verdict = 'verdadero' | 'falso' | 'dudoso'

export type Pattern = {
  id: string
  name: string
  description: string
  examples: string[]
}

export type KeyFact = {
  id: string
  claim: string
  verdict: Verdict
  source: string
}

// Populated by Alejandro from the Venezuela-Combate-FakeNews-Cuaderno
export const PATTERNS: Pattern[] = []
export const KEY_FACTS: KeyFact[] = []
