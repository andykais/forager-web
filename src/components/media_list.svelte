<script lang="ts">
  import IntersectionObserver from './intersection_observer.svelte';
  import Thumbnail from './thumbnail.svelte'
  import { search_engine, search_results } from '../stores/search'

  export let thumbnail_size: number
  $: total_loaded_results = $search_results.results.length

  function thumbnail_visible(media_index: number) {
    if (media_index + 1 === total_loaded_results) search_engine.load_more()
  }
</script>

<div class="h-full w-full text-center">
  {#each $search_results.results as media_reference, media_index (media_reference.id)}
    <div class="inline-grid m-2">
      <IntersectionObserver focused={false} on:intersect={() => thumbnail_visible(media_index)} refreshed_at={$search_results.last_search_at}>
        <Thumbnail {media_reference} size={thumbnail_size} />
      </IntersectionObserver>
    </div>
  {/each}
</div>
