import { writable, derived } from 'svelte/store'
import { client } from '../client'

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
      update((q) => ({ ...q, tags }))
    },
    set_stars: (stars?: number) => {
      update((q) => ({ ...q, stars }))
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

const search_results = (() => {
  const api_params = { query: {}, cursor: null, limit: 100 }
  const values = writable({
    loading: false,
    has_more_results: true,
    results: [],
    total_results: 0,
  })
  const { subscribe, update, set } = values

  // NOTE this returns an unsubscribe method, but I have no idea where to put it.
  // Thats technically a memory leak but its small enough that we shouldnt care
  search_query.subscribe((query) => {
    load_results(query, true)
  })

  function load_results(query: SearchQuery, refresh: boolean) {
    update((r) => ({ ...r, query, loading: true, has_more_results: true }))
    const is_empty_search_query = Object.keys(api_params.query).length === 0
    const data = is_empty_search_query
      ? await client.media.list(api_params)
      : await client.media.search(api_params)
    const has_more_results = data.results.length !== 0
    if (refresh) {
      set({ loading: false, has_more_results, results: data.results, total_results: data.total })
    } else {
      update(r => ({ loading: false, has_more_results: results: r.results.concat(data.results), total_results: data.total }))
    }
  }

  return {
    subscribe,
    load_more: () => {},
  }
})()

const search_query = {
  subscribe: search_query_store.subscribe,

  load_more_results: () => {},
}

let previous_state = { has_more_results: true, loading: false, results: [], cursor: null }
const search_results = derived(
  search_query,
  async ($search_query, set) => {
    set({ ...previous_state, loading: true })
    const response = await client.media.search({
      query: $search_query,
      limit: 100,
      cursor: previous_state.cursor,
    })
    const has_more_results = response.result.length
    set({
      results: previous_state.results.concat(response.result),
      has_more_results,
      loading: false,
      cursor: response.cursor,
    })
  },
  previous_state
)

async function load_thumbnails(search_query) {
  const is_new_search_query = search_query !== thumbnail_query.query
  if (is_new_search_query) {
    has_more_thumbnails = true
    delete thumbnail_query.cursor
  }
  if (has_more_thumbnails) {
    loading_thumbnails = true
    thumbnail_query = { ...thumbnail_query, query: search_query, limit: pagination_size }
    let result
    if (thumbnail_query.query) {
      result = await client.media.search(thumbnail_query)
    } else {
      result = await client.media.list(thumbnail_query)
    }
    total_media_references = result.total
    if (is_new_search_query) {
      total_unviewed = 0
      media_references = result.result
    } else {
      media_references = [...media_references, ...result.result]
    }
    total_unviewed += result.result.reduce(
      (count, r) => (r.view_count === 0 ? count + 1 : count),
      0
    )
    thumbnail_query.cursor = result.cursor
    loading_thumbnails = false
    has_more_thumbnails = Boolean(result.result.length)
  }
}

export { search_query, search_results }
