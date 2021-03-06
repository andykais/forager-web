import { get, writable, derived } from 'svelte/store'
import { client } from '../client'
import { search_results } from './search'
import type { MediaReferenceTR } from 'forager/models/media_reference'
import type { MediaFileTR } from 'forager/models/media_file'
import type { TagDataTR } from 'forager/models/tag'

type CurrentStore = {
  loading: boolean
  media_reference_id: number | null
  search_result_index: number
  media_reference: MediaReferenceTR | null
  media_file: MediaFileTR | null
  tags: TagDataTR[]
}
const initial_data = () => ({ loading: false, media_reference_id: null, search_result_index: 0, media_reference: null, media_file: null, tags: [] })
const current = (() => {
  const { subscribe, set, update } = writable<CurrentStore>(initial_data())

  return {
    subscribe,

    reset() {
      set(initial_data())
    },

    async set(search_result_index: number, media_reference_id: number) {
      if (media_reference_id === undefined) throw new Error('attempted opening a non existent search result')
      update(val => ({ ...val, loading: true, search_result_index, media_reference_id }))
      // TODO lets break this out into three separate derived stores.
      // We want media_file first so lets grab that first
      const data = await client.media.get_reference(media_reference_id)
      set({ loading: false, search_result_index, media_reference_id, ...data })
    },
    async add_view() {
      const { media_reference_id, search_result_index, loading } = get(current)
      if (loading || media_reference_id === null) throw new Error('cannot mark a view while current element is loading')
      await client.media.add_view(media_reference_id)
      update(val => {
        val.media_reference.view_count++
        return val
      })
      const { media_reference } = get(current)
      search_results.update_index(search_result_index, media_reference)
    },
    async star(star_count: number) {
      const { media_reference_id, search_result_index, loading } = get(current)
      if (loading || media_reference_id === null) throw new Error('cannot mark a view while current element is loading')
      await client.media.update(media_reference_id, { stars: star_count })
      update(val => {
        val.media_reference.stars = star_count
        return val
      })
      const { media_reference } = get(current)
      search_results.update_index(search_result_index, media_reference)
    }
  }
})()

export { current }
