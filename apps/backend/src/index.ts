import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

import type { Bindings } from './types'

const handler = new RPCHandler(router)
const app = new Hono<{ Bindings: Bindings }>()

// Any localhost / 127.0.0.1 origin on any port — for local dev against the
// deployed API. Safe to always allow: browsers set Origin from the page's real
// origin, so a remote attacker page can never present itself as localhost.
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use('*', (c, next) => {
  // CORS_ORIGIN holds one or more comma-separated origins. Trailing slashes are
  // stripped because browser `Origin` headers never include them. Unset →
  // '*' (fail-open). When set, we reflect any listed origin plus any localhost.
  const configured = c.env.CORS_ORIGIN
  const allowlist = configured
    ? configured.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean)
    : null

  return cors({
    origin: allowlist
      ? (origin) =>
          allowlist.includes(origin) || LOCALHOST_ORIGIN.test(origin) ? origin : null
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
