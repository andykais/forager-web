<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'

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
  let media_element
  let is_fullscreen = false

  function open_fullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
    is_fullscreen = true
  }
  function close_fullscreen(element) {
    document.exitFullscreen()
    is_fullscreen = false
  }

  const keyboard_shortcuts = new KeyboardShortcuts({
    ToggleFullScreen: (e) => {
      if (media_element) {
        if (is_fullscreen) close_fullscreen(media_element)
        else open_fullscreen(media_element)
      }
    }
  })
  console.log({ keyboard_shortcuts })
</script>

<div class="container">
  {#if media_file}
    {#if media_file.media_type === 'IMAGE'}
      <img bind:this={media_element} class="media-file" src="/api/media_file/{media_reference_id}" alt="no bueno">
    {:else if media_file.media_type === 'VIDEO'}
    <video
      bind:this={media_element}
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

<svelte:window on:keydown={keyboard_shortcuts.handler} />

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
