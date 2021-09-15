<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'
  import Search from '../components/search/toolbar.svelte'
  import MediaFile from '../components/media_file.svelte'
  import IntersectionObserver from '../components/intersection_observer.svelte'
  import Thumbnail from '../components/thumbnail.svelte'
  import MediaReferenceTags from '../components/media_reference.svelte'

  let FOCUS = 'thumbnail_grid'
  $: {
    if (FOCUS === 'thumbnail_grid' && show_media_file) {
      // TODO this is a hack until we have a stack on the FOCUS
      FOCUS = 'media_file'
    }

    if (FOCUS === 'thumbnail_grid' || FOCUS.startsWith('media_file')) {
      if (thumbnail_grid_el) thumbnail_grid_el.focus()
      console.log('Index enable', { FOCUS })
      keyboard_shortcuts.enable()
    } else {
    console.log('Index disable', { FOCUS })
      keyboard_shortcuts.disable()
    }
  }

  let show_video_preview_thumbnails = false
  let tags = []
  let media_references = []
  let total_media_references = 0
  let show_media_file = false
  let current_media_index = 0
  $: current_media_reference_id = media_references[current_media_index]?.id
  let current_media_reference
  let current_tags
  let current_media_file
  let loading_current_media_reference = true
  $: {
    if (current_media_reference_id !== undefined) on_change_media_reference(current_media_reference_id)
  }
  let media_reference_el
  let thumbnail_grid_el

  // NOTE that if the page is longer than the pagination size, we wont detect that we can load more thumbnails
  let pagination_size = 20
  let thumbnail_query = { limit: pagination_size }
  let has_more_thumbnails = true
  let loading_thumbnails = false
  let grid_width
  let num_grid_columns = 0
  $: {
    // we hardcode grid item width below
    if (grid_width) num_grid_columns = Math.floor(grid_width / (200 + 10))
  }
  let total_unviewed = 0

  onMount(async () => {
    tags = await client.tag.list()
    tags.sort((a, b) => a.group.localeCompare(b.group))
    /* const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 }) */
    await load_thumbnails()
  })

  async function load_thumbnails(search_query) {
    const is_new_search_query = search_query !== thumbnail_query.query
    if (is_new_search_query) {
      has_more_thumbnails = true
      delete thumbnail_query.cursor
    }
    if (has_more_thumbnails) {
      loading_thumbnails = true
      thumbnail_query = {...thumbnail_query, query: search_query, limit: pagination_size }
      let result
      if (thumbnail_query.query) {
        result = await client.media.search(thumbnail_query)
      } else {
        result = await client.media.list(thumbnail_query)
      }
      total_media_references = result.total
      if (is_new_search_query) {
        total_unviewed = 0
        media_references = result.result
      } else {
        media_references = [...media_references, ...result.result]
      }
      total_unviewed += result.result.reduce((count, r) => r.view_count === 0 ? count + 1 : count, 0)
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
    const prev_media_index = current_media_index
    current_media_index = media_index
    if (prev_media_index === current_media_index) open_media_file()
  }

  async function open_media_file() {
    show_media_file = true
    mark_view_media_file(current_media_reference_id)
  }
  async function on_change_media_reference(current_media_reference_id) {
    loading_current_media_reference = true
    const data = await client.media.get_file_info(current_media_reference_id)
    current_media_reference = data.media_reference
    current_media_file = data.media_file
    current_tags = data.tags
    loading_current_media_reference = false
    if (show_media_file) mark_view_media_file(current_media_reference_id)
  }
  async function mark_view_media_file(current_media_reference_id) {
    await client.media.add_view(current_media_reference_id)
    if (media_references[current_media_index].view_count === 0) total_unviewed -= 1
    media_references[current_media_index].view_count += 1
  }

  async function star_current_media(star_count) {
    await client.media.update(current_media_reference_id, { stars: star_count })
    media_references[current_media_index].stars = star_count
  }
  const keyboard_shortcuts = new KeyboardShortcuts({
    JumpToTop: (e) => {},
    JumpToBottom: (e) => {},

    OpenMedia: (e) => {
      if (media_references.length && !show_media_file) open_media_file()
    },
    CloseMedia: (e) => {
      if (FOCUS.startsWith('media_file')) show_media_file = false
    },
    NextMedia: (e) => {
      e.preventDefault()
      current_media_index = (current_media_index + 1) % media_references.length
    },
    PrevMedia: (e) => {
      e.preventDefault()
      current_media_index = (media_references.length + (current_media_index - 1)) % media_references.length
    },
    DownMedia: (e) => {
      e.preventDefault()
      if (current_media_index + num_grid_columns >= media_references.length) {
        const is_last_row = media_references.length % num_grid_columns > current_media_index % num_grid_columns
        if (is_last_row) current_media_index = 0
        else current_media_index = media_references.length - 1
      }
      else current_media_index = current_media_index + num_grid_columns
    },
    UpMedia: (e) => {
      e.preventDefault()
      if (current_media_index - num_grid_columns < 0) current_media_index = media_references.length - 1
      else current_media_index = current_media_index - num_grid_columns
    },
    ToggleVideoPreviewVsThumbails: (e) => {
      if (FOCUS === 'thumbnail_grid') {
        e.preventDefault()
        show_video_preview_thumbnails = !show_video_preview_thumbnails 
      }
    },

    Star0: (e) => star_current_media(0),
    Star1: (e) => star_current_media(1),
    Star2: (e) => star_current_media(2),
    Star3: (e) => star_current_media(3),
    Star4: (e) => star_current_media(4),
    Star5: (e) => star_current_media(5),
    ToggleViewTags: (e) => {},
    FocusSearch: (e) => {
      e.preventDefault()
      FOCUS = 'search:tag'
    },
    /* FocusNewTag: (e) => { */
    /*   e.preventDefault() */
    /*   FOCUS = 'media_reference:tag' */
    /* } */
  })
  async function handle_search(search_query) {
    if (Object.keys(search_query).length > 0) await load_thumbnails(search_query)
    else await load_thumbnails()
  }
  function on_click_outside_media(e) {
    if (e.path[1] === this) {
      FOCUS = 'thumbnail_grid'
      show_media_file = false
    }
  }

</script>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<div class="container">

  <div id="toolbars-grid">
    <MediaReferenceTags bind:this={media_reference_el} bind:FOCUS={FOCUS} media_reference={media_references[current_media_index]} tags={current_tags} loading={loading_current_media_reference} />

  <div id="search-plus-viewer">
  {#if show_media_file}
    <div class="media-file-container" on:click={on_click_outside_media}>
      <MediaFile bind:FOCUS={FOCUS} media_reference_id={current_media_reference_id} media_file={current_media_file} media_reference={current_media_reference} />
    </div>
  {/if}
  <div id="search-container">
    <Search bind:FOCUS={FOCUS} on_submit={handle_search} />
    <h5 class="text-right">{total_unviewed} Unread Viewing ({current_media_index + 1}/{total_media_references}) </h5>
  </div>

  <div id="thumbnail-grid-outer" bind:this={thumbnail_grid_el} bind:clientWidth={grid_width} tabindex="0">
    <div id="thumbnail-grid">
      {#each media_references as media_reference, media_index}
        <IntersectionObserver focused={current_media_reference_id === media_reference.id} on:intersect={handle_intersecting(media_reference.id)}>
          <Thumbnail {media_reference} stars={media_reference.stars} view_count={media_reference.view_count} show_video_preview={show_video_preview_thumbnails} on:click={handle_thumbnail_click(media_index)} focused={current_media_reference_id === media_reference.id}/>
        </IntersectionObserver>
      {/each}
      {#if loading_thumbnails}
        LOADING...
      {/if}
    </div>
    </div>
    </div>
  </div>
</div>

<style>
  #search-container {
    padding: 5px;
    background-color: var(--secondary-bg-color);
    /* box-shadow: 0 1px 2px 1px rgba(0,0,0,0.5); */
    box-shadow: 0 3px 2px -2px rgba(0,0,0,0.5);
    border-bottom: 3px solid white;
  }
  .text-right {
    text-align: right;
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  #toolbars-grid {
    /* display: grid; */
    /* grid-template-columns: 100px auto; */
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3fr;
    grid-template-rows: 100%;
  }
  #search-plus-viewer {
    height: 100vh;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .media-file-container {
    position: absolute;
    top: 0;
    z-index: 100;
    height: 100%;
    width: 100%;
    justify-content: center;
    display: flex;
  }
  #thumbnail-grid-outer {
    outline: none;
    width:100%;
    overflow-y: scroll;
  }
  #thumbnail-grid {
    margin: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    justify-items: center;
    grid-gap: 10px;
  }
</style>
