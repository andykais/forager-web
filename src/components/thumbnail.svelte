<script lang="ts">
  import { selected_media, selected } from '../stores/selected'
  import Icon from 'svelte-icon/index.mjs'
  import star from '../icons/zondicons/star-full.svg?raw'
  import * as utils from '../utils'
  import type { MediaReferenceTR } from 'forager/src/models/media_reference'

  // Props
  export let media_reference: MediaReferenceTR
  export let media_index: number
  export let size = 200
  $: detail = size > 160
    ? 'full' as const : size > 80
      ? 'date' as const : 'none' as const


  // Initialize vars
  const stars = Array(5).fill(null).map((_,i) => i + 1)
  const source_created_at = media_reference.source_created_at
    ? utils.format_date(new Date(media_reference.source_created_at))
    : ''



  // Handlers
  function handle_click() {
    selected_media.toggle(media_reference.id, media_index)
  }
</script>


<div
  on:click={handle_click}
  class="p-2 inline-flex items-center justify-center shadow shadow-slate-500 bg-slate-300 rounded-lg"
  class:bg-slate-700={$selected.has(media_reference.id)}
  style="width: {size}px; height: {size}px" >
  <div
    class="w-full h-full bg-center bg-contain bg-no-repeat"
    style="background-image: url(/api/thumbnail/{media_reference.id})" />
</div>
{#if detail !== 'none'}
  <div class="flex flex-row items-center px-1" class:justify-between={detail === 'full'} class:justify-center={detail === 'date'}>
    {#if detail === 'full'}
      <div>
        {#each stars as star_index}
          <div
            class="inline-flex px-[1px]"
            class:text-gray-500={media_reference.stars < star_index}
            class:text-gray-300={media_reference.stars >= star_index}>
            <Icon class="inline" data={star} size="12px" />
          </div>
        {/each}
      </div>
      {/if}
    <span class="text-sm text-gray-600">{source_created_at}</span>
  </div>
{/if}
