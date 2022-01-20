<script lang="ts">
  import Thumbnail from './thumbnail.svelte'
  import { search_results } from '../stores/search'

  export let thumbnail_size: number
</script>

<div class="h-full w-full text-center">
  {#each $search_results.results as media_reference (media_reference.id)}
    <Thumbnail {media_reference} size={thumbnail_size} />
  {/each}
</div>
