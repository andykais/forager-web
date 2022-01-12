<script lang="ts">
  import Icon from 'svelte-icon/index.mjs'
  import type { SortQuery } from './types'
  import down from '../../icons/zondicons/arrow-thick-down.svg?raw'
  import up from '../../icons/zondicons/arrow-thick-up.svg?raw'

  let sort_desc = false
  let sort_by: SortQuery['sort_by'] = 'source_created_at'
  export let on_submit: (sort_query: SortQuery) => void

  function handle_select(e: Event) {
    sort_by = (e.target as HTMLSelectElement).value as SortQuery['sort_by']
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
  }
  function handle_toggle_desc() {
    sort_desc = !sort_desc
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
}

</script>

<div class="flex items-center gap-1 text-slate-800 font-bold text-md">
  <select id="sort" class="bg-transparent" name="sort" value={sort_by} on:input={handle_select}>
    <option value="created_at">Added On</option>
    <option value="source_created_at">Created At</option>
    <option value="updated_at">Modified On</option>
  </select>
  <button class="px-1 hover:text-gray-300" on:click={handle_toggle_desc}>
    <Icon data={sort_desc ? down : up} size="16px"/>
  </button>
</div>
