<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../../client'
  import TagSearch from './tags.svelte'
  import StarsSearch from './stars.svelte'

  let search_query = {}

  export let FOCUS
  export let on_submit

  function handle_tag_select(selected_tags) {
    search_query = {...search_query, tag_ids: selected_tags.map(t => t.id)}
    if (selected_tags.length === 0) delete search_query.tag_ids
    on_submit(search_query)
  }
  function handle_stars_select(star_count) {
    search_query = {...search_query, stars: star_count}
    if (star_count === 0) delete search_query.stars
    on_submit(search_query)
  }
</script>

<div class="container">
  <TagSearch name="search" bind:FOCUS={FOCUS} on_submit={handle_tag_select} />

  <StarsSearch bind:FOCUS={FOCUS} on_submit={handle_stars_select}/>

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
