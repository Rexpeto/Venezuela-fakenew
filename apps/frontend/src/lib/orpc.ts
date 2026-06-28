import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { router } from 'backend/router'

const link = new RPCLink({
  url: `${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787'}/rpc`,
})

// Typed against the real backend router — any drift between a procedure's
// signature and its frontend call site is now a compile-time error.
export const orpc: RouterClient<typeof router> = createORPCClient(link)
