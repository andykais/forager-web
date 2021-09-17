<script lang="ts">
  import { onMount } from 'svelte'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'
  import { focus } from '../stores/focus'

  onMount(() => {
    focus.stack('media_file')
    document.addEventListener('fullscreenchange', handle_escape_fullscreen, false)
    document.addEventListener('mozfullscreenchange', handle_escape_fullscreen, false)
    document.addEventListener('MSFullscreenChange', handle_escape_fullscreen, false)
    document.addEventListener('webkitfullscreenchange', handle_escape_fullscreen, false)
    ;() => {
      document.removeEventListener('fullscreenchange', handle_escape_fullscreen)
      document.removeEventListener('mozfullscreenchange', handle_escape_fullscreen)
      document.removeEventListener('MSFullscreenChange', handle_escape_fullscreen)
      document.removeEventListener('webkitfullscreenchange', handle_escape_fullscreen)
    }
  })
  // we need to handle exiting via the Escape key, which cannot be caught with a keyboard listener
  function handle_escape_fullscreen(e) {
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
    } else {
      focus.stack('media_file')
    }
  }

  export let media_reference_id
  export let media_reference
  export let media_file

  let media_container
  let media_element
  let video_element
  let show_video_preview = false

  function open_fullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      /* Safari */
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      /* IE11 */
      element.msRequestFullscreen()
    }
    focus.stack('media_file:fullscreen')
  }
  function close_fullscreen(element) {
    document.exitFullscreen()
    focus.pop('media_file:fullscreen')
  }

  const keyboard_shortcuts = new KeyboardShortcuts({
    ToggleFullScreen: (e) => {
      if (media_element) {
        if ($focus === 'media_file:fullscreen') close_fullscreen(media_element)
        else open_fullscreen(media_element)
      }
    },
    PlayPauseMedia: (e) => {
      e.preventDefault()
      if (media_file.media_type === 'VIDEO') {
        if (video_element.paused) video_element.play()
        else video_element.pause()
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
    <div class="media-file-container" bind:this={media_element}>
      {#if media_file.media_type === 'IMAGE'}
        <img class="media-file" src="/api/media_file/{media_reference.id}" alt="media file" />
      {:else if media_file.media_type === 'VIDEO'}
        {#if show_video_preview}
          <img class="media-file thumbnail" src="/api/video_preview/{media_reference.id}" alt="media file video preview" />
        {:else}
          <video
            bind:this={video_element}
            style="min-width: {media_file.width}; min-height: {media_file.height}"
            class="media-file"
            src="/api/media_file/{media_reference_id}"
            type="video/mp4"
            controls
            autoplay>
            <source src="/api/media_file/{media_reference_id}"/>
            <track kind="captions"/> <!-- this exists purely to quiet down an A11y rule -->
          </video>
        {/if}
      {/if}
    </div>
  {:else}
    LOADING
  {/if}
</div>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<style>
  .container {
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    padding: 10px;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    justify-items: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
  }
  .media-file-container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    justify-content: center;
    align-items: center;
  }
  .media-file {
    max-width: 100%;
    max-height: 100%;
  }
  .thumbnail {
    min-width: 100%;
    min-height: 100%;
  }
</style>
