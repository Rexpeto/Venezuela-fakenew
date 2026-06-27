import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

type LLMEnv = {
  LLM_API_KEY: string
  LLM_BASE_URL?: string
  LLM_MODEL?: string
}

export function createLLM(env: LLMEnv): LanguageModel {
  const provider = createOpenAI({
    apiKey: env.LLM_API_KEY,
    ...(env.LLM_BASE_URL ? { baseURL: env.LLM_BASE_URL } : {}),
  })
  return provider(env.LLM_MODEL ?? 'gpt-4o-mini')
}
