<script lang="ts">
  import Thumbnail from './thumbnail.svelte'
  import { search_results } from '../stores/search'
</script>

<div class="h-full text-center">
  {#each $search_results.results as media_reference (media_reference.id)}
    <Thumbnail {media_reference} />
  {/each}
</div>
