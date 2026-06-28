import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

import type { Bindings } from './types'

const handler = new RPCHandler(router)
const app = new Hono<{ Bindings: Bindings }>()

app.use('*', (c, next) => {
  const origin = c.env.CORS_ORIGIN ?? '*'
  return cors({
    origin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })(c, next)
})

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc',
    context: { env: c.env },
  })
  if (matched) return c.newResponse(response.body, response)
  await next()
})

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
