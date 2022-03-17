<script lang="ts">
  import IntersectionObserver from './intersection_observer.svelte';
  import Thumbnail from './thumbnail.svelte'
  import { search_engine, search_results } from '../stores/search'
  import { selected, selected_media } from '../stores/selected'
  import { KeyboardShortcuts } from '../keyboard_shortcuts'
  import type { Config } from '../config'

  // Initialize props, vars, getters
  export let config: Config
  export let thumbnail_size: number
  $: total_loaded_results = $search_results.results.length
  $: selected_media.set_media_references($search_results.results)

  function thumbnail_visible(media_index: number) {
    if (media_index + 1 === total_loaded_results) search_engine.load_more()
  }

  // Listeners
  new KeyboardShortcuts(config, 'media_list', {
    ShiftDown: () => {
      selected_media.select_range(true)

    },
    ShiftUp: () => {
      selected_media.select_range(false)
    }
  })

</script>

<div class="h-full w-full text-center select-none">
  {#each $search_results.results as media_reference, media_index (media_reference.id)}
    <div class="inline-grid m-2">
      <IntersectionObserver focused={false} on:intersect={() => thumbnail_visible(media_index)} refreshed_at={$search_results.last_search_at}>
        <Thumbnail {media_reference} {media_index} size={thumbnail_size} />
      </IntersectionObserver>
    </div>
  {/each}
</div>
