import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

import type { Bindings } from './types'

const handler = new RPCHandler(router)
const app = new Hono<{ Bindings: Bindings }>()

// Compile CORS_ORIGIN_PATTERN once and cache it across requests in the same
// isolate. An invalid pattern is ignored (treated as "no pattern") instead of
// throwing, so a bad env value can't take the whole API down.
let patternCache: { src: string; re: RegExp | null } | null = null
function originPattern(src: string | undefined): RegExp | null {
  const key = src ?? ''
  if (!patternCache || patternCache.src !== key) {
    let re: RegExp | null = null
    if (key) {
      try {
        re = new RegExp(key)
      } catch {
        re = null
      }
    }
    patternCache = { src: key, re }
  }
  return patternCache.re
}

app.use('*', (c, next) => {
  // CORS_ORIGIN: comma-separated exact origins (trailing slashes stripped —
  // browser Origin headers never include one). CORS_ORIGIN_PATTERN: optional
  // anchored regex for dynamic allows (e.g. ^http://localhost(:\d+)?$).
  // Neither set → '*' (fail-open).
  const configured = c.env.CORS_ORIGIN
  const allowlist = configured
    ? configured.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean)
    : null
  const pattern = originPattern(c.env.CORS_ORIGIN_PATTERN)

  return cors({
    origin:
      allowlist || pattern
        ? (origin) =>
            allowlist?.includes(origin) || (origin ? pattern?.test(origin) : false)
              ? origin
              : null
        : '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })(c, next)
})

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc',
    context: {
      env: c.env,
      ip: c.req.header('CF-Connecting-IP') ?? c.req.header('x-forwarded-for') ?? null,
    },
  })
  if (matched) return c.newResponse(response.body, response)
  await next()
})

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
