import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: `${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787'}/rpc`,
})

// Once the router type is stable, type this with RouterClient<typeof router>
// import type { RouterClient } from '@orpc/server'
// import type { router } from 'backend/src/router'
// export const orpc: RouterClient<typeof router> = createORPCClient(link)

export const orpc = createORPCClient(link)
