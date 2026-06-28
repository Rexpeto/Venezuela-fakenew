import { Hono } from 'hono'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

import type { Bindings } from './types'

const handler = new RPCHandler(router)
const app = new Hono<{ Bindings: Bindings }>()

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
