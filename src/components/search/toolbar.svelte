<script lang="ts">
  import Tag from './tags.svelte'
  import Stars from './stars.svelte'
  import Sort from './sort_by.svelte'
  import Unread from './unread.svelte'
  import Icon from 'svelte-icon/index.mjs'
  import filter from '../../icons/zondicons/filter.svg?raw'
  import save_disk from '../../icons/zondicons/save-disk.svg?raw'
  import cog from '../../icons/zondicons/cog.svg?raw'
  import type * as types from './types'

  let show_advanced_filters = false

  function handle_toggle_advanced_filters() {
    show_advanced_filters = !show_advanced_filters
  }
  function handle_stars_submit(stars_query: types.StarsQuery) {
    console.log({ stars_query })
  }
  function handle_sort_submit(sort_query: types.SortQuery) {
    console.log({ sort_query })
  }
  function handle_unread_submit(unread_query: types.UnreadQuery) {
    console.log({ unread_query})
  }
</script>

<div class="bg-gray-600 border-b border-b-[2px] border-gray-800">
  <div class="px-3 py-3 grid grid-cols-5 items-center">
    <h1 class="text-lime-500 col-span-1">Forager Web</h1>
    <div class="col-span-3 grid grid-cols-1fr-auto items-center gap-3">
      <Tag />
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
    <div class="border-t border-t-[1px] border-gray-700 flex gap-6">
      <Stars on_submit={handle_stars_submit} />
      <Sort on_submit={handle_sort_submit}/>
      <Unread on_submit={handle_unread_submit} />
    </div>
  {/if}
</div>
