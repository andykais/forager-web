<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import TagSearch from './tag-search.svelte'

  let input = ''
  let tag_search_focus = false

  export let focus = false
  $: focus = tag_search_focus // || sort_focus
</script>

<div class="container">
  <TagSearch bind:tag_search_input={input} bind:focus={tag_search_focus} />

  <div>
    <h4>Stars</h4>
    <span>★ ★ ★ ☆ ☆</span>
  </div>

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
    display:  grid;
    grid-template-columns: 1fr auto auto;
    grid-gap: 20px;
  }
</style>
