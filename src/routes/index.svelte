<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import MediaFile from '../components/media_file.svelte'
  import IntersectionObserver from '../components/intersection_observer.svelte'
  import Thumbnail from '../components/thumbnail.svelte'

  let tags = []
  let media_references = []
  let total_media_references = 0
  let show_media_file = false
  let current_media_reference_id

  let thumbnail_query = { limit: 5 }
  let has_more_thumbnails = true
  let loading_thumbnails = false
  /* let last_thumbnail_el */
  /* let intersecting = false */
  /* $: { */
  /*   if (last_thumbnail_el && intersecting) { */
  /*     load_thumbnails() */
  /*   } */
  /* } */

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

  const handle_click_thumbnail = (media_reference_id: number) => () => {
    console.log({ media_reference_id })
    current_media_reference_id = media_reference_id
    show_media_file = true
  }

  function handle_keypress(e) {
    if (e.code === 'Escape') show_media_file = false
  }

  async function handle_intersecting(media_reference) {
    /* console.log('handle_intersection', el.detail.target) */
    const last_media_reference = media_references[media_references.length - 1]
    if (media_reference.id === last_media_reference.id) {
      console.log('load more please')
      await load_thumbnails()
    }
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
        <IntersectionObserver on:intersect={() => handle_intersecting(media_reference)}>
          <Thumbnail
            {media_reference}
            on:click={handle_click_thumbnail(media_reference.id)}
            focused={current_media_reference_id === media_reference.id}/>
        </IntersectionObserver>
      {/each}
      {#if loading_thumbnails}
        LOADING...
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    width: 100%;
  }
  .media-file-container {
    position: fixed;
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
    padding: 1px 5px;
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
  }
</style>
