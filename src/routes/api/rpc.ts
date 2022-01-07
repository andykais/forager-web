import type { Request } from '@sveltejs/kit'

export async function put(req: Request) {
  return await req.locals.rpc_server.sveltekit_handler(req)
}
