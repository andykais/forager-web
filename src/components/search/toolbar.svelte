<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../../client'
  /* import TagSearch from './tags.svelte' */
  import TagSearch from './tags-ss.svelte'
  import StarsSearch from './stars.svelte'
  import UnreadSearch from './unread.svelte'
  import { search_query } from '../../stores/search'


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
</script>

<div class="container">
  <div>
    <h4>Tags</h4>
    <TagSearch name="search" on_submit={handle_tag_select} />
  </div>

  <StarsSearch on_submit={handle_stars_select}/>

  <UnreadSearch on_submit={handle_unread_toggle} />

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
    grid-template-columns: 1fr auto auto auto;
    grid-gap: 20px;
  }
</style>
