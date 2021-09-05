<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import MediaFile from '../components/media_file.svelte'

  let tags = []
  let media_references = []
  let total_media_references = 0
  let show_media_file = false
  let current_media_reference_id

  onMount(async () => {
    tags = await client.tag.list()
    /* const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 }) */
    const result = await client.media.list()
    total_media_references = result.total
    media_references = result.result
    console.log({ media_references })
  })

  function handle_click_thumbnail(media_reference_id: number) {
    current_media_reference_id = media_reference_id
    show_media_file = true
  }

  function handle_keypress(e) {
    if (e.code === "Escape") show_media_file = false
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
      <div class="tag" style="background-color: #{tag.color}">{tag.group}:{tag.name}</div>
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
        <div class="thumbnail-outer">
          <div class="thumbnail" on:click={() => handle_click_thumbnail(media_reference.id)}>
            <img
              src="/api/thumbnail/{media_reference.id}"
              alt="/api/thumbnail/{media_reference.id}"
            />
            <!--
          -->
          </div>
        </div>
      {/each}
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
