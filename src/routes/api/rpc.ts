import { forager } from '../../forager'
import { create_rpc_server } from 'ts-rpc/server'
import type { Request } from '@sveltejs/kit'
// import type { TagTR } from 'forager/build/src/models'
import type { ForagerSpec } from '../../spec'

class ForagerApiServer {
  media = {
    search: async (query_data: any) => {
      return forager.media.search(query_data)
    }
  }
  tag = {
    list: () => {
      const result =  forager.tag.list()
      console.log({ result })
      return result
    }
  }
}
// const rpc_server = create_rpc_server<ForagerSpec>(new ForagerApiServer())
const rpc_server = create_rpc_server<ForagerSpec>(forager)

export async function put(req: Request) {
  return await rpc_server.sveltekit_handler(req)
}

export {}
