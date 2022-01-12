<script lang="ts">
  import Icon from 'svelte-icon/index.mjs'
  import star from '../../icons/zondicons/star-full.svg?raw'
  import type { StarsQuery } from './types'

  const stars_indexes = Array(5).fill(0).map((_, i) => i + 1)
  let hovered_index = 0
  const comparison_display = {'eq': '==', 'gte': '>='}

  export let on_submit: (stars_query: StarsQuery) => void

  let comparison: StarsQuery['comparison'] = 'gte'
  let stars = 0

  function on_mouseover(star_index: number) {
    hovered_index = star_index
  }
  function on_mouseleave() {
    hovered_index = 0
  }
  function on_click(star_index: number) {
    if (stars === star_index) stars = 0
    else stars = star_index
    submit()
  }
  function on_toggle_comparison() {
    if (comparison === 'eq') comparison = 'gte'
    else comparison = 'eq'
    submit()
  }
  function submit() {
    if (stars === 0) on_submit({})
    else on_submit({ comparison, stars })
  }
  function handle_focus() {}
</script>

<div class="flex items-center">
  {#each stars_indexes as star_index}
    <button
      class="text-gray-700 px-[2px]"
      class:text-gray-400={stars >= star_index && hovered_index < star_index}
      class:text-gray-300={hovered_index >= star_index}
      on:mouseover={() => on_mouseover(star_index)}
      on:mouseleave={() => on_mouseleave()}
      on:focus={handle_focus}
      on:click={() => on_click(star_index)}>
      <Icon data={star} size="18px" />
    </button>
  {/each}
  <button class="text-gray-700 px-[2px] font-bold hover:text-gray-400 text-xl pb-[2px]" on:click={on_toggle_comparison}>
    {comparison_display[comparison]}
  </button>
</div>
