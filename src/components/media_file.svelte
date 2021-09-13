<script lang="ts">
  import { onMount } from 'svelte'
  /* import { client } from '../client' */
  import { KeyboardShortcuts } from '../keyboard-shortcuts'

  onMount(() => {
    /* await load_media_file_info(media_reference_id) */
    document.addEventListener('fullscreenchange', handle_escape_fullscreen, false);
    document.addEventListener('mozfullscreenchange', handle_escape_fullscreen, false);
    document.addEventListener('MSFullscreenChange', handle_escape_fullscreen, false);
    document.addEventListener('webkitfullscreenchange', handle_escape_fullscreen, false);
    () => {
      document.removeEventListener('fullscreenchange', handle_escape_fullscreen);
      document.removeEventListener('mozfullscreenchange', handle_escape_fullscreen);
      document.removeEventListener('MSFullscreenChange', handle_escape_fullscreen);
      document.removeEventListener('webkitfullscreenchange', handle_escape_fullscreen);
    }
  })
  // we need to handle exiting via the Escape key, which cannot be caught with a keyboard listener
  function handle_escape_fullscreen(e) {
     if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
     } else {
       is_fullscreen = false
     }
  }

  /* async function load_media_file_info(media_reference_id) { */
  /*   console.log('loading data info') */
  /*   const data = await client.media.get_file_info(media_reference_id) */
  /*   media_reference = data.media_reference */
  /*   media_file = data.media_file */
  /*   tags = data.tags */
  /* } */
  export let media_reference_id
  export let media_reference
  export let media_file
  /* let media_file = null */
  /* let media_reference */
  /* let tags */
  let media_container
  let media_element
  // NOTE Esc key while fullscreened doesnt appear to get captured
  let is_fullscreen = false
  /* $: load_media_file_info(media_reference_id) */
  let show_video_preview = false

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
    },
    PlayPauseMedia: (e) => {
      e.preventDefault()
      if (media_file.media_type === 'VIDEO') {
        if (media_element.paused) media_element.play()
        else media_element.pause()
      }
    },
    ToggleVideoPreviewVsThumbails: (e) => {
      e.preventDefault()
      show_video_preview = !show_video_preview 
    },
  })

</script>

<div class="container" bind:this={media_container}>
  {#if media_file}
    {#if media_file.media_type === 'IMAGE'}
      <img bind:this={media_element} class="media-file" src="/api/media_file/{media_reference.id}" alt="no bueno">
    {:else if media_file.media_type === 'VIDEO'}
      {#if show_video_preview}
        <img src="/api/video_preview/{media_reference.id}" />
      {:else}
        <video
          bind:this={media_element}
          style="min-width: {media_file.width}; min-height: {media_file.height}"
          class="media-file"
          src="/api/media_file/{media_reference_id}"
          type="video/mp4"
          controls
          autoplay
        />
      {/if}
    {/if}
  {:else}
    LOADING
  {/if}
</div>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<style>
  .container {
    height: 100vh;
    width: 100%;
    display: grid;
    /* padding: 10px; */
    grid-template-rows: minmax(0, 1fr);
    justify-items: center;
    align-items: center;
    background-color: rgba(0,0,0,0.8);
  }
  .media-file {
    max-height: 100%;
    max-width: 100%;
  }
</style>
