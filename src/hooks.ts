import { create_rpc_server } from 'ts-rpc/server'
import type { Forager } from 'forager'
import type { ForagerSpec } from '../../spec'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Forager } = require('forager')

// const database_path = 'normal.db'
const database_path = '/media/veracrypt7/scrapers/likee.video/forager.db'
// const database_path = '/home/andrew/Code/development/forager/normal.db'
const forager: Forager = new Forager({ database_path, log_level: 'info' })
forager.init()


class ForagerApiServer {
  media = {
    update: async (...args) => {
      await forager.media.update(...args)
    },

    search: async (query_data: any) => {
      return forager.media.search(query_data)
    },

    add_view: async (query_data) => {
      await forager.media.add_view(query_data)
    },

    get_file_info: async (query_data) => {
      const data = forager.media.get_file_info(query_data)
      return data
    },
    list: (query_data) => {
      const result = forager.media.list(query_data)
      return result
    },
  }
  tag = {
    list: () => {
      const result =  forager.tag.list()
      return result
    },
    add_tags: (media_reference_id, tags) => {
      const result = forager.tag.add_tags(media_reference_id, tags)
      return result
    },
    remove_tags: (media_reference_id, tags) => {
      return forager.tag.remove_tags(media_reference_id, tags)
    }
  }
}

export async function handle({ request, resolve }) {
  request.locals.forager = forager
  request.locals.rpc_server = create_rpc_server<ForagerSpec>(new ForagerApiServer())
  return await resolve(request)
}

export { forager }
