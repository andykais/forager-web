// import { Forager } from 'forager'
import { create_rpc_server } from 'ts-rpc/server'
import type { Request } from '@sveltejs/kit'
// import type { TagTR } from 'forager/build/src/models'
import type { ForagerSpec } from '../../spec'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Forager } = require('forager')

const forager = new Forager({ database_path: 'sqlite.db' })
forager.init()

class ForagerApiServer {
  media = {
    search: async (query_data: any) => {
      return forager.media.search(query_data)
    }
  }
}
const rpc_server = create_rpc_server<ForagerSpec>(new ForagerApiServer())

export async function put(req: Request) {
  return await rpc_server.sveltekit_handler(req)
}

export {}
