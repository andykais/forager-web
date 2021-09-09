<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import TagSearch from './tag_search.svelte'
  import StarsSearch from './stars_search.svelte'

  let input = ''
  let tag_search_focus = false
  let search_query = {}

  export let focus = false
  export let on_submit

  $: focus = tag_search_focus // || sort_focus

  function handle_tag_select(tag_ids) {
    search_query = {...search_query, tag_ids}
    if (tag_ids.length === 0) delete search_query.tag_ids
    on_submit(search_query)
  }
  function handle_stars_select(star_count) {
    search_query = {...search_query, stars: star_count}
    if (star_count === 0) delete search_query.stars
    on_submit(search_query)
  }
</script>

<div class="container">
  <TagSearch bind:input bind:focus={tag_search_focus} on_submit={handle_tag_select} />

  <StarsSearch on_submit={handle_stars_select}/>

  <div>
    <h4>Sort</h4>
    <select id="sort" name="sort">
      <option value="Added On">Added On</option>
      <option value="Created At">Created At</option>
      <option value="Modified On">Modified On</option>
    </select>
    <span>↑ ↓</span>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-gap: 20px;
  }
</style>
