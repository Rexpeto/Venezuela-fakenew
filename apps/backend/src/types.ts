export type Bindings = {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  LLM_API_KEY: string
  LLM_BASE_URL?: string
  LLM_MODEL?: string
  TAVILY_API_KEY: string
  // Comma-separated exact origins to allow.
  CORS_ORIGIN?: string
  // Optional regex (matched against the request Origin) for dynamic allows,
  // e.g. local dev: ^http://localhost(:\d+)?$  — keep it ANCHORED (^…$).
  CORS_ORIGIN_PATTERN?: string
}
