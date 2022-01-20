import { writable } from 'svelte/store'
import { client } from '../client'
import type * as types from '../components/search/types'
import type { MediaReferenceTR } from 'forager/src/models/media_reference' // TODO we should go back to a postbuild step in forager lib


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
  }

  public set_query(query: types.SearchQuery) {
    this.query = query
    return this.search({refresh: true})
  }

  public url_encode_query() {
  }
  public url_decode_query() {
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
    console.log('search', {refresh})
    const api_params: SearchApiParams = {
      query: this.query,
      limit: this.pagination_size
    }
    if (refresh === false) api_params.cursor = this.cursor
    const res = await client.media.search(api_params)
    this.ui_data.loading = false
    this.ui_data.total = res.total
    this.ui_data.has_more_results = res.result.length > 0
    this.cursor = res.cursor
    if (refresh) this.ui_data.results = res.result
    else this.ui_data.results = this.ui_data.results.concat(res.result)
  console.log('loaded results', this.ui_data.results.length, res)
    search_results.set(this.ui_data)
  }
}


const search_engine = new SearchEngine()
const search_results = writable(search_engine.ui_data)

export { search_engine, search_results }
