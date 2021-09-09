<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'
  import Search from '../components/search.svelte'
  import MediaFile from '../components/media_file.svelte'
  import IntersectionObserver from '../components/intersection_observer.svelte'
  import Thumbnail from '../components/thumbnail.svelte'

  let tags = []
  let media_references = []
  let total_media_references = 0
  let show_media_file = false
  let current_media_index = 0
  $: current_media_reference_id = media_references[current_media_index]?.id

  let pagination_size = 10
  let thumbnail_query = { limit: pagination_size }
  let has_more_thumbnails = true
  let loading_thumbnails = false
  let search_focus = false

  onMount(async () => {
    tags = await client.tag.list()
    tags.sort((a, b) => a.group.localeCompare(b.group))
    /* const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 }) */
    await load_thumbnails()
  })

  async function load_thumbnails(search_query) {
    if (has_more_thumbnails) {
      loading_thumbnails = true
      const append_new_thumbnails = search_query === thumbnail_query.query
      thumbnail_query = {...thumbnail_query, query: search_query, limit: pagination_size }
      if (!append_new_thumbnails) delete thumbnail_query.cursor
      let result
      if (thumbnail_query.query) {
        result = await client.media.search(thumbnail_query)
      } else {
        result = await client.media.list(thumbnail_query)
      }
      total_media_references = result.total
      if (append_new_thumbnails) {
        media_references = [...media_references, ...result.result]
      } else {
        media_references = result.result
      }
      thumbnail_query.cursor = result.cursor
      loading_thumbnails = false
      has_more_thumbnails = Boolean(result.result.length)
    }
  }

  const handle_intersecting = (media_reference_id: number) => async () => {
    const last_media_reference = media_references[media_references.length - 1]
    if (media_reference_id === last_media_reference.id) {
      await load_thumbnails(thumbnail_query.query)
    }
  }

  const handle_thumbnail_click = (media_index) => () => {
    current_media_index = media_index
    show_media_file = true
  }
  const keyboard_shortcuts = new KeyboardShortcuts({
    JumpToTop: (e) => {},
    JumpToBottom: (e) => {},

    OpenMedia: (e) => {
      show_media_file = true
    },
    CloseMedia: (e) => {
      show_media_file = false
    },
    NextMedia: (e) => {
      current_media_index = (current_media_index + 1) % media_references.length
    },
    PrevMedia: (e) => {
      current_media_index = (media_references.length + (current_media_index - 1)) % media_references.length
    },

    Star1: (e) => {},
    Star2: (e) => {},
    Star3: (e) => {},
    Star4: (e) => {},
    Star5: (e) => {},
    ToggleViewTags: (e) => {},
  })
  $: {
    if (search_focus) keyboard_shortcuts.disable()
    else keyboard_shortcuts.enable()
  }
  async function handle_search(search_query) {
    if (search_query.tag_ids.length > 0) await load_thumbnails(search_query)
    else await load_thumbnails()
  }
</script>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<div class="container">
  {#if show_media_file}
    <div class="media-file-container">
      <MediaFile media_reference_id={current_media_reference_id} />
    </div>
  {/if}

  <Search bind:focus={search_focus} on_submit={handle_search} />

  <h4>Media ({total_media_references} total)</h4>
  <div id="thumbnail-grid-outer">
    <div id="thumbnail-grid">
      {#each media_references as media_reference, media_index}
        <IntersectionObserver on:intersect={handle_intersecting(media_reference.id)}>
          <Thumbnail {media_reference} on:click={handle_thumbnail_click(media_index)} focused={current_media_reference_id === media_reference.id}/>
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
    padding: 5px;
  }
  .media-file-container {
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    display: flex;
  }
  #thumbnail-grid-outer {
    margin: 10px;
    width: calc(100% - 20px);
  }
  #thumbnail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    justify-items: center;
    grid-gap: 10px;
  }
</style>
