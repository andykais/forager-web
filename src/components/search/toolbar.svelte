<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../../client'
  /* import TagSearch from './tags.svelte' */
  import TagSearch from './tags-ss.svelte'
  import StarsSearch from './stars.svelte'

  let search_query = {}

  export let on_submit
  /* $: { */
  /*   search_query = { stars: star_count, tag_ids: selected_tags.map(t => t.id) } */
  /*   if (search_query.tag_ids.length === 0) delete search_query.tag_ids */
  /*   if (search_query.stars === 0) delete search_query.stars */
  /* } */

  function handle_tag_select(selected_tags) {
  console.log('handle_tag_select')
    // NOTE perf: if we need to speed things up we can store tag_ids client side
    search_query = {...search_query, tags: selected_tags}
    if (selected_tags.length === 0) delete search_query.tags
    on_submit(search_query)
  }
  function handle_stars_select(star_count) {
    search_query = {...search_query, stars: star_count}
    if (star_count === 0) delete search_query.stars
    on_submit(search_query)
  }
</script>

<div class="container">
  <TagSearch name="search" on_submit={handle_tag_select} />

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
