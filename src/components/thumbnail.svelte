<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import * as date_fns from 'date-fns'

  export let media_reference
  export let stars
  export let view_count
  export let focused = false

  let display_stars = '☆ ☆ ☆ ☆ ☆'
  $: {
    const stars_str = Array(stars).fill('★')
    const empty_stars_str = Array(5 - stars).fill('☆')
    display_stars = ([...stars_str, ...empty_stars_str]).join(' ')
  }

  const dispatch = createEventDispatcher()
  const { source_created_at } = media_reference
  const source_created_ago = source_created_at
    ? `created ${date_fns.formatDistanceToNow(new Date(source_created_at))} ago`
    : 'unknown create date'
</script>

<div class="thumbnail-plus-info">
  <div class="thumbnail-outer" on:click class:focused={focused}>
    <div class="thumbnail" >
      <img src="/api/thumbnail/{media_reference.id}" alt="/api/thumbnail/{media_reference.id}" />
      <!--
    -->
    </div>
  </div>
  <div class="thumbnail-info">
    <div class="grid-2">
      <span>{display_stars}</span>
      <span>{view_count} views</span>
    </div>
    <div class="grid-2">
      <span>{source_created_ago}</span>
      <span>{media_reference.tag_count} tags</span>
    </div>
  </div>
</div>

<style>
  .thumbnail-plus-info {
    width: 200px;
    margin: 10px 0;
  }
  .thumbnail-outer {
    height: calc(200px - 10px);
    width: calc(200px - 10px);
    /* padding: 5px; */
    /* background-color: green; */
    display: inline-flex;
    justify-content: center;

    background-color: rgba(0,0,0,0.2);
    border-radius: 5px;
    box-shadow: 1px 0px 3px 1px rgba(0, 0, 0, 0.2);
    border: 5px solid rgba(255,255,255,0.6);
  }
  .focused {
    box-shadow: 0px 0px 3px 2px rgba(0, 0, 0, 0.3);
    /* box-shadow:none; */
    border: 5px solid rgba(255,255,255,0.9);
    background-color: rgba(255,255,255,0.9);
  }
  .thumbnail {
    border-radius: 5px;
    display: inline-block;
    /* background-color: red; */
    /* box-shadow: 1px 1px 8px 1px rgba(0, 0, 0, 0.4); */
    border-radius: 5px;
    height: 100%;
    display: inline-flex;
    flex-flow: column;
    justify-content: center;
  }

  .thumbnail > img {
    /* border-radius: 5px; */
    max-height: calc(200px - 10px);
    max-width: calc(200px - 10px);
    /* max-height: 100%; */
    /* max-width: 100%; */
  }

  .thumbnail-info {
    display: grid;
    grid-template-rows: 1fr 1fr;
    font-size: 12px;
    color: rgba(0,0,0,0.7);
    margin-top: 5px;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr auto;
  }
</style>
