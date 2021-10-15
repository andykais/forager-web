import { get, writable, derived } from 'svelte/store'
import { client } from '../client'
import type { MediaReferenceTR } from 'forager/models/media_reference'

type EncodedSearchQuery = {[key: string]: string}
export function encode_search_query(search_query: SearchQuery): EncodedSearchQuery {
  const encoded: EncodedSearchQuery = {}
  for (const [key, value] of Object.entries(search_query)) {
    switch(key) {
      case 'tags':
        if (value.length) encoded[key] = value.map(v => `${v.group}:${v.name}`).join(',')
        break
      case 'stars':
        encoded[key] = value
        break
      case 'unread':
        encoded[key] = value ? 'true' : 'false'
        break
      case 'sort_by':
        encoded[key] = value
        break
      case 'order':
        encoded[key] = value
        break
      default:
        throw new Error(`unknown search query param '${key}' ${JSON.stringify(value)}`)
    }
  }
  return encoded
}

export function decode_search_query(search_query_object: EncodedSearchQuery): SearchQuery {
  const decoded: SearchQuery = {}
  for (const [key, value] of Object.entries(search_query_object)) {
    switch(key) {
      case 'tags':
        decoded.tags = value.split(',').map(tag_str => {
          const parsed = value.split(':')
          const group = parsed.length ? parsed[0] : ''
          const name = parsed.length ? parsed[1] : parsed[0]
          return { group, name }
        })
        break
      case 'stars':
        decoded[key] = parseInt(value)
        break
      case 'unread':
        decoded[key] = value === 'true' ? true : false
        break
      case 'sort_by':
        decoded[key] = value
        break
      case 'order':
        decoded[key] = value
        break
      default:
        throw new Error(`unknown search query param '${key}'`)
    }
  }
  return decoded
}

const PAGINATION_SIZE = 20

type TagIdentifier = { name: string; group?: string }
type SearchQuery = { tags?: TagIdentifier[]; stars?: number }
let should_trigger_search = false
const search_query = (() => {
  const { set, update, subscribe } = writable({} as SearchQuery)

  return {
    subscribe,
    set: (query: SearchQuery) => {
      should_trigger_search = true
      set(query)
    },
    set_tags: (tags: TagIdentifier[]) => {
      should_trigger_search = true
      update(q => ({ ...q, tags }))
    },
    set_stars: (stars?: number) => {
      should_trigger_search = true
      update(q => {
        // TODO when we add `toggle_star_operator`, we should make this function better
        if (stars === 0) {
          delete q.stars
          return  q
        }
        return {...q, stars}
      })
    },
    toggle_star_operator: () => {
      throw new Error('unimplemented')
    },
    set_sort: (sort: {sort_by: string; order: 'desc' | 'asc'}) => {
      should_trigger_search = true
      update(q => ({ ...q, ...sort }))
    },
    set_unread_filter: (on: boolean) => {
      should_trigger_search = true
      update(q => {
        if (on) return { ...q, unread: true }
        else {
          delete q.unread
          return q
        }
      })
    },
  }
})()

type SearchApiParams = {query: SearchQuery; limit: number; cursor?: Date}
const search_results = (() => {
  const api_params: SearchApiParams = { query: {}, cursor: null, limit: PAGINATION_SIZE }
  let store_data = {
    loading: false,
    has_more_results: true,
    results: [] as MediaReferenceTR[],
    total: 0,
    unread_count: 0,
  }
  const store = writable(store_data)
  const { subscribe, update, set } = store

  // NOTE this returns an unsubscribe method, but I have no idea where to put it.
  // Thats technically a memory leak but its small enough that we shouldnt care
  const unsubscribe_search_query = search_query.subscribe(query => {
    // were tracking when search is affected because the first subscription seems to fuck up maybe on the
    // server, and just an initial var seems to get reset on the client
    if (should_trigger_search) {
      api_params.query = query
      load_results(true)
    }
  })


  async function load_results(refresh: boolean) {
    if (refresh === false && store_data.has_more_results === false) return
    if (store_data.loading === true) throw new Error('queueing up/throttling multiple requests is unimplemented')
    if (refresh) api_params.cursor = null
    update((r) => ({ ...r, loading: true }))
    const is_empty_search_query = Object.keys(api_params.query).length === 0
    const data = is_empty_search_query
      ? await client.media.list({ cursor: api_params.cursor, limit: api_params.limit })
      : await client.media.search(api_params)
    api_params.cursor = data.cursor
    const has_more_results = data.result.length !== 0
    const unread_count = data.result.reduce((count, mr) => count + mr.view_count, 0)
    if (refresh) {
      store_data = { loading: false, has_more_results, results: data.result, total: data.total, unread_count }
    } else {
      store_data = {
        loading: false,
        has_more_results,
        unread_count: store_data.unread_count + unread_count,
        results: store_data.results.concat(data.result),
        total: data.total
      }
    }
    set(store_data)
  }

  return {
    subscribe,
    // we lose types but this should cancel the boys properly
    // subscribe(...args: any[]) {
    //   const unsubscribe = subscribe(...args)
    //   return () => {
    //     unsubscribe_search_query()
    //     unsubscribe()
    //   }
    // },

    load_more: async () => {
      await load_results(false)
    },

    update_index: (search_result_index: number, new_media_reference: MediaReferenceTR) => {
      let unread_count = store_data.unread_count
      const old_media_reference = store_data.results[search_result_index]
      if (old_media_reference.view_count === 0 && new_media_reference.view_count > 0) unread_count++
      store_data.results[search_result_index] = new_media_reference
      set(store_data)
    },

    remove_index: (search_result_index: number) => {
      store_data.results.splice(search_result_index, 1)
      store_data.total --
      set(store_data)
    }
  }
})()

export { search_query, search_results }
