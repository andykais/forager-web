<script lang="ts">
  import { onMount } from 'svelte'
  import Tag from './tags.svelte'
  import Stars from './stars.svelte'
  import Sort from './sort_by.svelte'
  import Unread from './unread.svelte'
  import Icon from 'svelte-icon/index.mjs'
  import filter from '../../icons/zondicons/filter.svg?raw'
  import save_disk from '../../icons/zondicons/save-disk.svg?raw'
  import cog from '../../icons/zondicons/cog.svg?raw'
  import type * as types from './types'
  import { search_engine } from '../../stores/search'
  import type { Config } from '../../config'

  let show_advanced_filters = true
  let stars_query: types.StarsQuery = {}
  let sort_query: types.SortQuery = {}
  let unread_query: types.UnreadQuery = {}
  let tags_query: types.TagsQuery = {}

  export let config: Config
  export let height = 0

  onMount(() => {
    ({
      stars_query,
      sort_query,
      unread_query,
      tags_query
    } = search_engine.url_decode_query(config, new URLSearchParams(window.location.search)))
    search_engine.set_query({...stars_query, ...sort_query, ...unread_query, ...tags_query})
  })

  function search() {
    const query = {
      ...stars_query,
      ...sort_query,
      ...unread_query,
      ...tags_query 
    }
    search_engine.set_query(query)
    const url_encoded_search_query = search_engine.url_encode_query(config, query).toString()
    console.log({url_encoded_search_query})
    if (url_encoded_search_query) window.history.pushState('', '', '?' + url_encoded_search_query)
    else window.history.pushState('', '', window.location.pathname)
  }

  function handle_toggle_advanced_filters() {
    show_advanced_filters = !show_advanced_filters
  }
  function handle_tags_submit(query: types.TagsQuery) {
    tags_query = query
    search()
  }
  function handle_stars_submit(query: types.StarsQuery) {
    stars_query = query
    search()
  }
  function handle_sort_submit(query: types.SortQuery) {
    sort_query = query
    search()
  }
  function handle_unread_submit(query: types.UnreadQuery) {
    unread_query = query
    search()
  }
</script>

<div class="bg-gray-600 border-b-[2px] border-gray-800" bind:clientHeight={height}>
  <div class="px-3 py-3 grid grid-cols-5 items-center">
    <h1 class="text-lime-500 col-span-1">Forager Web</h1>
    <div class="col-span-3 grid grid-cols-1fr-auto items-center gap-3">
      <Tag {config} on_submit={handle_tags_submit} bind:tags_query={tags_query} />
      <button
        title="Advanced Filters"
        class="text-gray-700 hover:text-gray-800 hover:bg-gray-700 p-1 rounded-sm hover:shadow-inner hover:shadow-slate-800"
        on:click={handle_toggle_advanced_filters}>
          <Icon data={filter} size="22px" />
      </button>
    </div>
    <div class="col-span-1 flex justify-end gap-2">
      <button title="Export Selected to Disk" class="text-gray-300 hover:text-gray-100"><Icon data={save_disk} /></button>
      <button title="Settings" class="text-gray-300 hover:text-gray-100"><Icon data={cog} /></button>
    </div>
  </div>
  {#if show_advanced_filters}
    <div class="border-t-[1px] border-gray-700 flex gap-14 justify-center">
      <Stars on_submit={handle_stars_submit} bind:stars_query={stars_query} />
      <Sort on_submit={handle_sort_submit} bind:sort_query={sort_query} />
      <Unread on_submit={handle_unread_submit} />
    </div>
  {/if}
</div>
