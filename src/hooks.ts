import { create_rpc_server } from 'ts-rpc/server'
// import { Forager } from 'forager'
import type { Forager as ForagerImpl } from 'forager'
import type { ForagerSpec } from './spec'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Forager: typeof ForagerImpl = require('forager').Forager

const database_path = process.env['DATABASE'] ?? 'normal.db'
const forager = new Forager({ database_path, log_level: 'info' })

class ForagerApiServer {
  media = forager.media
  tag = forager.tag
}


let initted = false
export async function handle({ request, resolve }) {
  if (!initted) {
    await forager.init()
    initted = true
  }
  request.locals.forager = forager
  request.locals.rpc_server = create_rpc_server<ForagerSpec>(new ForagerApiServer())
  return await resolve(request)
}

export { forager }
