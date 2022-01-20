import { create_rpc_server } from 'ts-rpc/server'
import type { RPCServer } from 'ts-rpc/server'
// import { Forager } from 'forager'
import type { Forager as ForagerImpl } from 'forager'
import type { ForagerSpec } from './spec'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Forager: typeof ForagerImpl = require('forager').Forager
import { load_config, type Config } from './config'
import type { Request as SvelteRequest } from '@sveltejs/kit'


type Locals = {
  forager: ForagerImpl
  rpc_server: RPCServer<ForagerSpec>
}
export type Request<Body = any> = SvelteRequest<Locals, Body>

let initialized = false
const resources: { config?: Config; forager?: ForagerImpl } = {}
export async function handle({ event, resolve }) {
  if (!initialized) {
    const config = await load_config(process.env['CONFIG'])
    console.log({ config })
    const forager = new Forager({ database_path: config.database_path, log_level: 'info' })
    await forager.init()
    resources.forager = forager
    resources.config = config
    initialized = true
  }
  event.locals.config = resources.config
  event.locals.forager = resources.forager
  event.locals.rpc_server = create_rpc_server<ForagerSpec>(resources.forager)
  return await resolve(event)
}

export const getSession: GetSession = (event) => {
  return {
    config: event.locals.config
  }
}
