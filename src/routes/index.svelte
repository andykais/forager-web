<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import MediaFile from '../components/media_file.svelte'
  import IntersectionObserver from '../components/intersection-observer.svelte'
  import Thumbnail from '../components/thumbnail.svelte'

  let tags = []
  let media_references = []
  let total_media_references = 0
  let show_media_file = false
  let current_media_reference_id

  let thumbnail_query = { limit: 100 }
  let has_more_thumbnails = true
  let loading_thumbnails = false
  let last_thumbnail_el
  let intersecting = false
  $: {
    if (last_thumbnail_el && intersecting) {
      load_thumbnails()
    }
  }

  onMount(async () => {
    tags = await client.tag.list()
    tags.sort((a, b) => a.group.localeCompare(b.group))
    console.log({ tags })
    /* const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 }) */
    await load_thumbnails()
  })

  async function load_thumbnails() {
    if (has_more_thumbnails) {
      loading_thumbnails = true
      const result = await client.media.list(thumbnail_query)
      total_media_references = result.total
      media_references = [...media_references, ...result.result]
      thumbnail_query.cursor = result.cursor
      console.log('loaded', result.result.length, 'results')
      loading_thumbnails = false
      has_more_thumbnails = Boolean(result.result.length)
    }
  }

  function handle_click_thumbnail(media_reference_id: number) {
    current_media_reference_id = media_reference_id
    show_media_file = true
  }

  function handle_keypress(e) {
    if (e.code === 'Escape') show_media_file = false
  }
</script>

<svelte:window on:keydown={handle_keypress} />

<div class="container">
  {#if show_media_file}
    <div class="media-file-container">
      <MediaFile media_reference_id={current_media_reference_id} />
    </div>
  {/if}

  <h4>Tags:</h4>
  <div id="tags">
    {#each tags as tag}
      <div class="tag" style="background-color: {tag.color}">{tag.group}:{tag.name}</div>
    {/each}
  </div>

  <h4>Media ({total_media_references} total)</h4>
  <div id="thumbnail-grid-outer">
    <div id="thumbnail-grid">
      {#each media_references as media_reference}
        <!--
        <a class="thumbnail" href="/media_file/{media_reference.id}">
        </a>
        -->
        {#if media_reference.id === media_references[media_references.length - 1].id}
          <IntersectionObserver element={last_thumbnail_el} bind:intersecting once={true}>
            <Thumbnail
              {media_reference}
              bind:thumbnail_el={last_thumbnail_el}
              on_click={handle_click_thumbnail}
            />
          </IntersectionObserver>
        {:else}
          <Thumbnail
            {media_reference}
            bind:thumbnail_el={last_thumbnail_el}
            on_click={handle_click_thumbnail}
          />
        {/if}
      {/each}
      {#if loading_thumbnails}
        LOADING...
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    /* height: 100%; */
    /* position: relative; */
  }
  .media-file-container {
    position: fixed;
    /* position: sticky; */
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    display: flex;
  }
  #tags {
    font-family: monospace;
    height: 200px;
    overflow-y: scroll;
    padding: 5px 0;
  }

  .tag {
    padding: 0 5px;
    margin: 2px;
    border-radius: 2px;
  }

  #thumbnail-grid-outer {
    margin: 10px;
    width: calc(100% - 20px);
  }
  #thumbnail-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    /* display: grid; */
    /* grid-template-columns: repeat(3, 1fr); */
    /* grid-gap: 20px; */
    /* margin: 10px; */
    /* width: calc(100% - 20px); */
  }
  .thumbnail-outer {
    margin: 10px 0;
    height: 200px;
    width: 200px;
    background-color: green;
    display: inline-flex;
    justify-content: center;
  }
  .thumbnail {
    display: inline-block;
    background-color: red;
    box-shadow: 1px 1px 8px 1px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    height: 100%;
    display: inline-flex;
    flex-flow: column;
    justify-content: center;
  }

  .thumbnail > img {
    max-height: 200px;
    max-width: 200px;
    /* max-height: 100%; */
    /* max-width: 100%; */
  }
</style>
