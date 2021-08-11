import { Forager } from 'forager'
import { create_rpc_server, CreateServerApi } from 'ts-rpc/server'
import type { TagTR } from 'forager/build/src/models'
import type { ForagerSpec } from '../../spec'

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
export async function put(req: any, res: any, next: any) {
  console.log({ req })
  const response = await rpc_server.sveltekit_handler(req, res, next)
  console.log({ response })
  return response
}

export {}
