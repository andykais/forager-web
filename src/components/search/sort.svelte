<script lang="ts">
  import { onMount } from 'svelte'
  import { decode_search_query } from '../../stores/search'

  export let on_submit

  let sort_by = 'source_created_at'
  let sort_desc = true

  onMount(() => {
    const params = {}
    new URLSearchParams(window.location.search).forEach((v,k) => params[k] = v)
    const search_query_params = decode_search_query(params)
    if (search_query_params['sort_by']) sort_by = search_query_params['sort_by']
    if (search_query_params['order']) sort_desc = search_query_params['order'] === 'desc'
  })

  function handle_select(e) {
    sort_by = e.target.value
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
  }
  function handle_toggle() {
    sort_desc = !sort_desc
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
  }
</script>


<div>
  <h4>Sort</h4>
  <select id="sort" name="sort" value={sort_by} on:input={handle_select}>
    <option value="created_at">Added On</option>
    <option value="source_created_at">Created At</option>
    <option value="updated_at">Modified On</option>
  </select>
  <button on:click={handle_toggle}>{#if sort_desc}↑{:else}↓{/if}</button>
</div>
