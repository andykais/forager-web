import { create_rpc_server } from 'ts-rpc/server'
import type { RPCServer } from 'ts-rpc/server'
// import { Forager } from 'forager'
import type { Forager as ForagerImpl } from 'forager'
import type { ForagerSpec } from './spec'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Forager: typeof ForagerImpl = require('forager').Forager
import { Config } from './config'
import type { Request as SvelteRequest } from '@sveltejs/kit'


let initialized = false
const resources: { config?: Config; forager?: ForagerImpl } = {}
export async function handle({ request, resolve }) {
  if (!initialized) {
    const config = await Config.load(process.env['CONFIG'])
    console.log({ config })
    const forager = new Forager({ database_path: config.database_path, log_level: 'info' })
    await forager.init()
    resources.forager = forager
    resources.config = config
    initialized = true
  }
  request.locals.forager = resources.forager
  request.locals.rpc_server = create_rpc_server<ForagerSpec>(resources.forager)
  return await resolve(request)
}

type Locals = {
  forager: ForagerImpl
  rpc_server: RPCServer<ForagerSpec>
}
export type Request<Body = any> = SvelteRequest<Locals, Body>
