import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

import type { Bindings } from './types'

const handler = new RPCHandler(router)
const app = new Hono<{ Bindings: Bindings }>()

app.use('*', (c, next) => {
  // CORS_ORIGIN may hold one or more comma-separated origins. Trailing slashes
  // are stripped because browser `Origin` headers never include them. Unset
  // defaults to '*' (fail-open) — set the exact origin(s) before going live.
  const configured = c.env.CORS_ORIGIN
  const origin = configured
    ? configured.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean)
    : '*'
  return cors({
    origin,
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
