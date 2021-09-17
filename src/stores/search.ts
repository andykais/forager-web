import { get, writable, derived } from 'svelte/store'
import { client } from '../client'
import type { MediaReferenceTR } from 'forager/models/media_reference'

const PAGINATION_SIZE = 20

type TagIdentifier = { name: string; group?: string }
type SearchQuery = { tag?: TagIdentifier[]; stars?: number }
const search_query = (() => {
  const { set, update, subscribe } = writable({} as SearchQuery)

  return {
    subscribe,
    set: (query: SearchQuery) => {
      set(query)
    },
    set_tags: (tags: TagIdentifier[]) => {
      update(q => ({ ...q, tags }))
    },
    set_stars: (stars?: number) => {
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
    set_sort: (sort_by: string) => {
      throw new Error('unimplemented')
    },
    toggle_unread_filter: () => {
      throw new Error('unimplemented')
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
  let initial_event = true
  const unsubscribe_search_query = search_query.subscribe(query => {
    if (!initial_event) {
      api_params.query = query
      load_results(true)
    }
    initial_event = false
  })


  async function load_results(refresh: boolean) {
    if (store_data.has_more_results === false) return
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
  }
})()

export { search_query, search_results }
