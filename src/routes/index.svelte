<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'
  import Search from '../components/search/toolbar.svelte'
  import MediaFile from '../components/media_file.svelte'
  import IntersectionObserver from '../components/intersection_observer.svelte'
  import Thumbnail from '../components/thumbnail.svelte'
  import MediaReferenceTags from '../components/media_reference.svelte'
  import TagDetail from '../components/tag-detail.svelte'
  import { focus } from '../stores/focus'
  import { search_query, search_results, encode_search_query, decode_search_query } from '../stores/search'
  import { current } from '../stores/current'

  let show_video_preview_thumbnails = false
  let show_media_file = false
  let media_references = []
  let current_media_index = 0
  let should_load_current = false
  let mounted = false
  let popup_tag = null
  $: search_refreshed = $search_results.loading === false && $search_results.results.length > 0
  $: if (search_refreshed) on_search_refresh()
  $: if ($search_query) current_media_index = 0
  function on_search_refresh() {
    /* current_media_index = 0 */
    current.set(current_media_index, $search_results.results[current_media_index].id)
  }

  $: media_references = $search_results.results
/* $: console.log(media_references.map(r => r.id)) */

  let loading_current_media_reference = true
  let thumbnail_grid_el

  // NOTE that if the page is longer than the pagination size, we wont detect that we can load more thumbnails
  let grid_width
  let num_grid_columns = 0

  $: {
    if ($focus === 'thumbnail_grid') keyboard_shortcuts.enable()
    else keyboard_shortcuts.disable()
    /* // TODO we can probably move Escape into MediaFile and bind show_media_file (or use a store even) */
    /* if ($focus === 'thumbnail_grid' || $focus.startsWith('media_file')) { */
    /*   /1* if (thumbnail_grid_el) thumbnail_grid_el.focus() *1/ */
    /*   keyboard_shortcuts.enable() */
    /* } else { */
    /*   keyboard_shortcuts.disable() */
    /* } */
  }

  $: {
    // we hardcode grid thumbnail width below (in the future  we'll add a slider for shrinking/growing it)
    if (grid_width) num_grid_columns = Math.floor(grid_width / (200 + 10))
  }
  let total_unviewed = 0
  $: total_unviewed = $search_results.unread_count

  $: {
    if (mounted) {
      const encoded_search_query = encode_search_query($search_query)
      const entries = Object.entries(encoded_search_query)
      entries.sort((a,b) => a[0].localeCompare(b[0]))
      const params = entries.map(([k,v]) => `${k}=${v}`).join('&')
      /* const params = new URLSearchParams(encoded_search_query) */ // the builtin escapes colons (properly), which is harder to read
      if (Object.keys(params).length) {
        window.history.pushState('', '', '?' + params.toString())
      } else {
        window.history.pushState('', '', window.location.pathname)
      }
    }
  }

  onMount(async () => {
    mounted = true
    const params = {}
    new URLSearchParams(window.location.search).forEach((v,k) => params[k] = v)
    const search_query_params = decode_search_query(params)
    search_query.set(search_query_params)
    /* await search_results.load_more() */
    /* await current.set(current_media_index, $search_results.results[current_media_index].id) */
  })

  async function on_intersect(media_reference_id: number) {
    const last_media_reference = media_references[media_references.length - 1]
    if (media_reference_id === last_media_reference.id) {
      await search_results.load_more()
    }
  }

  const handle_thumbnail_click = (media_index) => () => {
    const prev_media_index = current_media_index
    current_media_index = media_index
    if (prev_media_index === current_media_index) show_media_file = true
    on_media_index_change()
  }

  async function on_media_index_change() {
    let expected_index = current_media_index
    await current.set(current_media_index, $search_results.results[current_media_index].id)
    if (current_media_index === expected_index && show_media_file) await current.add_view()
  }

  async function on_star_media(star_count) {
    await current.star(star_count)
    /* await client.media.update(media_references[current_media_index].id, { stars: star_count }) */
    /* media_references[current_media_index].stars = star_count */
    /* $current.media_reference.star = star_count */
  }

  function on_next_media() {
    if ($search_results.results.length === 0) return
    // TODO not sure I love the "Unread Mode". It might be fine just as a regular search filter instead
    /* if ($search_query.unread && $search_results.results[current_media_index].view_count > 0) { */
    /*   search_results.remove_index(current_media_index) */
    /*   current_media_index -- */
    /* } */
    current_media_index = (current_media_index + 1) % media_references.length
    on_media_index_change()
  }
  function on_prev_media() {
    if ($search_results.results.length === 0) return
    /* if ($search_query.unread && $search_results.results[current_media_index].view_count > 0) search_results.remove_index(current_media_index) */
    current_media_index = (media_references.length + (current_media_index - 1)) % media_references.length
    on_media_index_change()
  }
  function on_down_media() {
    if ($search_results.results.length === 0) return
    if (show_media_file) return // we shouldnt allow up and down when the media is being viewed
    /* if ($search_query.unread && $search_results.results[current_media_index].view_count > 0) search_results.remove_index(current_media_index) */
    if (current_media_index + num_grid_columns >= media_references.length) {
      const is_last_row = media_references.length % num_grid_columns > current_media_index % num_grid_columns
      if (is_last_row) current_media_index = 0
      else current_media_index = media_references.length - 1
    }
    else current_media_index = current_media_index + num_grid_columns
    on_media_index_change()
  }
  function on_up_media() {
    if ($search_results.results.length === 0) return
    if (show_media_file) return // we shouldnt allow up and down when the media is being viewed
    /* if ($search_query.unread && $search_results.results[current_media_index].view_count > 0) search_results.remove_index(current_media_index) */
    if (current_media_index - num_grid_columns < 0) current_media_index = media_references.length - 1
    else current_media_index = current_media_index - num_grid_columns
    on_media_index_change()
  }
  function on_close_media() {
    focus.pop('media_file')
    show_media_file = false
  }

  const keyboard_shortcuts = new KeyboardShortcuts({
    OpenMedia: (e) => {
      if (media_references.length && !show_media_file) show_media_file = true
      on_media_index_change()
    },
    NextMedia: (e) => {
      e.preventDefault()
      on_next_media()
    },
    PrevMedia: (e) => {
      e.preventDefault()
      on_prev_media()
    },
    DownMedia: (e) => {
      e.preventDefault()
      on_down_media()
    },
    UpMedia: (e) => {
      e.preventDefault()
      on_up_media()
    },
    ToggleVideoPreviewVsThumbails: (e) => {
      // TODO if we stop meshing grid keyboard shortcuts w/ media file shortcuts, we dont need  this if statement
      if ($focus === 'thumbnail_grid') {
        e.preventDefault()
        show_video_preview_thumbnails = !show_video_preview_thumbnails 
      }
    },

    Star0: (e) => on_star_media(0),
    Star1: (e) => on_star_media(1),
    Star2: (e) => on_star_media(2),
    Star3: (e) => on_star_media(3),
    Star4: (e) => on_star_media(4),
    Star5: (e) => on_star_media(5),
    ToggleViewTags: (e) => {},
    FocusSearch: (e) => {
      e.preventDefault()
      focus.stack('search:tag:input')
    },
  })

  function on_click_outside_media(e) {
    // make sure that we only close the media when clicking on the surrounding div, not the image
    // (theres probably a more robust solution here)
    if (e.path[2] === this) {
      focus.reset('thumbnail_grid')
      show_media_file = false
    }
  }
  function on_click_outside_tag_detail(e) {
    console.log('outside')
    // make sure that we only close the media when clicking on the surrounding div, not the image
    // (theres probably a more robust solution here)
    if (e.path[0] === this) {
      focus.reset('thumbnail_grid')
      popup_tag = null
    }
  }

</script>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<div class="container">

  <div id="toolbars-grid">
    <MediaReferenceTags media_reference={$current.media_reference} tags={$current.tags} loading={$current.loading} bind:popup_tag={popup_tag} />

  <div id="search-plus-viewer">
  {#if show_media_file}
    <div class="media-file-container" on:click={on_click_outside_media}>
      <MediaFile
        media_reference_id={$current.media_reference_id}
        media_file={$current.media_file}
        media_reference={$current.media_reference}
        {on_next_media}
        {on_prev_media}
        {on_close_media}
        {on_star_media}/>
    </div>
  {/if}
  {#if popup_tag}
    <div class="media-file-container" on:click={on_click_outside_tag_detail}>
      <TagDetail tag={popup_tag} />
    </div>
  {/if}
  <div id="search-container">
    <Search />
    <h5 class="text-right">{total_unviewed} Unread Viewing ({current_media_index + 1}/{$search_results.total}) </h5>
  </div>

  <div id="thumbnail-grid-outer" bind:this={thumbnail_grid_el} bind:clientWidth={grid_width} tabindex="0">
    <div id="thumbnail-grid">
      {#each media_references as media_reference, media_index (media_reference.id)}
        <div>
        <IntersectionObserver focused={$current.media_reference_id === media_reference.id} on:intersect={() => on_intersect(media_reference.id)}>
          <Thumbnail {media_reference} stars={media_reference.stars} view_count={media_reference.view_count} show_video_preview={show_video_preview_thumbnails} on:click={handle_thumbnail_click(media_index)} focused={$current.media_reference_id === media_reference.id}/>
        </IntersectionObserver>
        <!--
        {media_reference.id}
        -->
        </div>
      {/each}
      {#if $search_results.loading}
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
