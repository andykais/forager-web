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
  const store = writable({
    loading: false,
    has_more_results: true,
    results: [] as MediaReferenceTR[],
    total: 0,
    unread_count: 0,
  })
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
    if (get(store).has_more_results === false) return
    if (get(store).loading === true) throw new Error('queueing up/throttling multiple requests is unimplemented')
    if (refresh) api_params.cursor = null
    update((r) => ({ ...r, loading: true }))
    const is_empty_search_query = Object.keys(api_params.query).length === 0
    const data = is_empty_search_query
      ? await client.media.list({ cursor: api_params.cursor, limit: api_params.limit })
      : await client.media.search(api_params)
    api_params.cursor = data.cursor
    const has_more_results = data.result.length !== 0
    const unread_count = data.result.reduce((count, mr) => count + mr.view_count, 0)
    console.log(data)
    if (refresh) {
      set({ loading: false, has_more_results, results: data.result, total: data.total, unread_count })
    } else {
      update(r => ({
        loading: false,
        has_more_results,
        unread_count: r.unread_count + unread_count,
        results: r.results.concat(data.result),
        total: data.total
      }))
    }
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

    load_more: () => {
      load_results(false)
    },

    add_view: async (media_reference_index: number) => {
      const media_reference = get(store).results[media_reference_index]
      if (media_reference === undefined) throw new Error('attempted accessing non-existent index')
      await client.media.add_view(media_reference.id)
      store.update(r => {
        let unread_count = r.unread_count
        if (media_reference.view_count === 0) unread_count ++
        r.results[media_reference_index].view_count ++
        return { ...r, unread_count }
      })
    }
  }
})()

export { search_query, search_results }
