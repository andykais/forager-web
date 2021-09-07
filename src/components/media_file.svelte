<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'

  onMount(async () => {
    const data = await client.media.get_file_info(media_reference_id)
    media_reference = data.media_reference
    media_file = data.media_file
    tags = data.tags
  })
  export let media_reference_id
  let media_file
  let media_reference
  let tags
</script>

<div class="container">
  {#if media_file}
    {#if media_file.media_type === 'IMAGE'}
      <img class="media-file" src="/api/media_file/{media_reference_id}" alt="no bueno">
    {:else if media_file.media_type === 'VIDEO'}
    <video
      style="max-width: {media_file.width}; max-height: {media_file.height}"
      class="media-file"
      src="/api/media_file/{media_reference_id}"
      type="video/mp4"
      controls
      autoplay
    />
    {/if}
  {:else}
    LOADING
  {/if}
</div>

<style>
  .container {
    height: 100%;
    width: 100%;
    display: grid;
    /* padding: 10px; */
    justify-items: center;
  }
  video.media-file {
    /* height: 100%; */
  }

  .media-file {
    max-height: 100vh;
    max-width: 100%;
  }
</style>
