import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

type LLMEnv = {
  LLM_API_KEY: string
  LLM_BASE_URL?: string
  LLM_MODEL?: string
}

export function createLLM(env: LLMEnv): LanguageModel {
  // Anthropic keys start with sk-ant-; use native provider so generateObject
  // works correctly (OpenAI compat endpoint ignores response_format/JSON schema)
  if (env.LLM_API_KEY.startsWith('sk-ant-') && !env.LLM_BASE_URL) {
    const provider = createAnthropic({ apiKey: env.LLM_API_KEY })
    return provider(env.LLM_MODEL ?? 'claude-haiku-4-5-20251001')
  }

  const provider = createOpenAI({
    apiKey: env.LLM_API_KEY,
    ...(env.LLM_BASE_URL ? { baseURL: env.LLM_BASE_URL } : {}),
  })
  return provider(env.LLM_MODEL ?? 'gpt-4o-mini')
}
