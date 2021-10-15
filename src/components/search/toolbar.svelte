<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../../client'
  /* import TagSearch from './tags.svelte' */
  import TagSearch from './tags-ss.svelte'
  import StarsSearch from './stars.svelte'
  import UnreadSearch from './unread.svelte'
  import SortSearch from './sort.svelte'
  import { search_query, decode_search_query } from '../../stores/search'

  let tag_input = ''
  onMount(() => {
    const params = {}
    new URLSearchParams(window.location.search).forEach((v,k) => params[k] = v)
    const search_query_params = decode_search_query(params)
    if (search_query_params['tags']) tag_input = search_query_params['tags'].map(t => `${t.group}:${t.name}`).join(' ')
  })


  function handle_tag_select(selected_tags) {
    // NOTE(perf): if we need to speed things up we can store tag_ids client side
    search_query.set_tags(selected_tags)
  }
  function handle_stars_select(star_count) {
    search_query.set_stars(star_count)
  }
  function handle_unread_toggle(toggle) {
    search_query.set_unread_filter(toggle)
  }
  function handle_sort_select(sort) {
    search_query.set_sort(sort)
  }
</script>

<div class="container">
  <div>
    <h4>Tags</h4>
    <TagSearch name="search" bind:input={tag_input} on_submit={handle_tag_select} />
  </div>

  <StarsSearch on_submit={handle_stars_select}/>

  <UnreadSearch on_submit={handle_unread_toggle} />

  <SortSearch on_submit={handle_sort_select} />
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    grid-gap: 20px;
  }
</style>
