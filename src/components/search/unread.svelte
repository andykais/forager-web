<script lang="ts">
  import { onMount } from 'svelte'
  import { decode_search_query } from '../../stores/search'

  export let on_submit

  let unread_only = false

  onMount(() => {
    const params = {}
    new URLSearchParams(window.location.search).forEach((v,k) => params[k] = v)
    const search_query_params = decode_search_query(params)
    if (search_query_params['unread']) unread_only = search_query_params['unread']
  })

  async function handle_input() {
    unread_only = !unread_only
    on_submit(unread_only)
  }
</script>

<div>
  <h4>Unread</h4>
  <input checked={unread_only} on:input={handle_input} type="checkbox" />
</div>
