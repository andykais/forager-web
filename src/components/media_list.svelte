<script lang="ts">
  import Thumbnail from './thumbnail.svelte'
  import { search_results } from '../stores/search'

  console.log($search_results)
</script>

<div class="h-full">
{#each $search_results.results as media_reference (media_reference.id)}
  <li>
    <Thumbnail {media_reference} />
  </li>
{/each}
</div>
