import type { RequestEvent } from '@sveltejs/kit'

export async function put(req: RequestEvent) {
  return await req.locals.rpc_server.sveltekit_handler(req)
}
