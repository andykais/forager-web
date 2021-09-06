<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import * as date_fns from 'date-fns'

  export let media_reference
  export let focused = false

  const { source_created_at } = media_reference
  const dispatch = createEventDispatcher()
  let source_created_ago = source_created_at ? date_fns.formatDistanceToNow(new Date(source_created_at)) : 'unknown'

  function handle_click_thumbnail(e) {
    e.preventDefault()
    dispatch('click', media_reference.id)
  }
</script>

<div class="thumbnail-plus-info">
  <a class="thumbnail-outer" href="#" on:click|preventDefault class:focused={focused}>
    <div class="thumbnail" >
      <img src="/api/thumbnail/{media_reference.id}" alt="/api/thumbnail/{media_reference.id}" />
      <!--
    -->
    </div>
  </a>
  <div class="thumbnail-info">
    <span>★ ★ ★ ☆ ☆</span>
    <span>created {source_created_ago} ago</span>
  </div>
</div>

<style>
  .thumbnail-plus-info {
    width: 200px;
    margin: 10px 0;
  }
  .thumbnail-outer {
    height: 200px;
    width: 200px;
    /* background-color: green; */
    display: inline-flex;
    justify-content: center;

    background-color: rgba(0,0,0,0.1);
    border-radius: 5px;
    box-shadow: 1px 0px 3px 1px rgba(0, 0, 0, 0.2);
    /* border: 0.5px solid rgba(255,255,255,0.9); */
  }
  .focused {
    background-color: rgba(0,0,0,0.4);
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
    border-radius: 5px;
    max-height: 200px;
    max-width: 200px;
    /* max-height: 100%; */
    /* max-width: 100%; */
  }

  .thumbnail-info {
    display: grid;
    grid-template-rows: 1fr 1fr;
    font-size: 12px;
    color: rgba(0,0,0,0.7);
  }
</style>
