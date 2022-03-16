import { writable } from 'svelte/store'
import { client } from '../client'
import type * as types from '../components/search/types'
import type { TagDataTR } from 'forager/src/models/tag'
import type { MediaReferenceTR } from 'forager/src/models/media_reference' // TODO we should go back to a postbuild step in forager lib
import type { Config } from '../config'


type ResolvePromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
type SearchApiParams = Parameters<typeof client.media.search>[0]
type SearchResult = ResolvePromise<ReturnType<typeof client.media.search>>


class SearchEngine {
  private pagination_size = 20
  private query: types.SearchQuery = { sort_by: 'source_created_at', order: 'desc'}
  private cursor: SearchResult['cursor'] | undefined

  public ui_data = {
    loading: false,
    has_more_results: true,
    total: 0,
    results: [] as MediaReferenceTR[],
    last_search_at: Date.now(),
  }

  public set_query(query: types.SearchQuery) {
    this.query = query
    return this.search({refresh: true})
  }

  public encode_tag_row(tag: TagDataTR) {
    let encoded = tag.name
    if (tag.group) encoded = `${tag.group}:${encoded}`
    return encoded
  }

  public encode_tag(tag: types.TagIdentifier) {
    let encoded = tag.name
    if (tag.group) encoded = `${tag.group}:${encoded}`
    if (tag.not === true) encoded = `-${encoded}`
    return encoded
  }

  public decode_tag(tag_str: string): types.TagIdentifier {
    let group: undefined | string = undefined
    let name = ''
    let not = tag_str.startsWith('-')
    const split = tag_str
      .replace(/^[-]/, '')
      .trim()
      .split(':')
    if (split.length === 2) {
      group = split[0]
      name = split[1]
    } else if (split.length === 1) {
      name = split[0]
    } else {
      throw new Error(`invalid tag string ${tag_str}`)
    }
    return { not, name, group }
  }

  public url_encode_query(config: Config, query: types.SearchQuery) {
    const encoded: URLSearchParams = new URLSearchParams()
    Object.keys(query).forEach(key => {
      const value = this.query[key]
      switch(key) {
        case 'tags':
          const tags_str = value.map(tag => this.encode_tag(tag)).join(',')
          if (tags_str.length > 0) encoded.set(key, tags_str)
          break
        case 'sort_by':
        case 'order':
        case 'stars':
        case 'stars_equality':
          if (config.default_search_params[key] !== value) encoded.set(key, value)
          break
        case 'unread':
          if (config.default_search_params[key] !== value) encoded.set(key, value ? 'true' : 'false')
          break
        default:
          throw new Error(`unknown search query param '${key}' ${JSON.stringify(value)}`)
      }
    })
    return encoded
  }
  public url_decode_query(config: Config, params: URLSearchParams) {
    // const decoded: types.SearchQuery = { ...config.default_search_params }
    const decoded =  {
      stars_query: {
        stars: config.default_search_params.stars,
        stars_equality: config.default_search_params.stars_equality,
      } as types.StarsQuery,
      sort_query: {
        sort_by: config.default_search_params.sort_by,
        order: config.default_search_params.order,
      } as types.SortQuery,
      unread_query: {
        unread: config.default_search_params.unread,
      } as types.UnreadQuery,
      tags_query: {} as types.TagsQuery,
    }
    params.forEach((value, key: keyof types.SearchQuery) => {
      switch(key) {
        case 'tags':
          const tags = value
            .split(',')
            .filter(v => v.length > 0)
            .map(v => this.decode_tag(v))
          decoded.tags_query[key] = tags
          break
        case 'stars':
          decoded.stars_query[key] = parseInt(value)
          break
        case 'stars_equality':
          decoded.stars_query[key] = value as types.SearchQuery['stars_equality']
          break
        case 'unread':
          decoded.unread_query[key] = value === 'true' ? true : false
          break
        case 'sort_by':
          decoded.sort_query[key] = value as types.SearchQuery['sort_by']
          break
        case 'order':
          decoded.sort_query[key] = value as types.SearchQuery['order']
          break
        default:
          throw new Error(`unknown search query param '${key}' ${JSON.stringify(value)}`)
      }
    })
    return decoded
  }

  public set_pagination_size(limit: number) {
    this.pagination_size = limit
    return this.search({refresh: true})
  }

  public async load_more() {
    if (this.ui_data.has_more_results) {
      await this.search({refresh: false})
    }
  }

  private async search({ refresh }: {refresh: boolean}) {
    const api_params: SearchApiParams = {
      query: this.query,
      limit: this.pagination_size
    }
    if (refresh === false) api_params.cursor = this.cursor
    const res = await client.media.search(api_params)
    this.ui_data.loading = false
    this.ui_data.total = res.total
    this.ui_data.has_more_results = res.result.length > 0
    this.ui_data.last_search_at = Date.now()
    this.cursor = res.cursor
    if (refresh) this.ui_data.results = res.result
    else this.ui_data.results = this.ui_data.results.concat(res.result)
    search_results.set(this.ui_data)
  }
}


const search_engine = new SearchEngine()
const search_results = writable(search_engine.ui_data)

export { search_engine, search_results }
