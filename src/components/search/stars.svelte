<script lang="ts">
  import { onMount } from 'svelte'
  import { decode_search_query } from '../../stores/search'
  import { focus } from '../../stores/focus'

  export let on_submit

  const stars_indexes = Array(5).fill(0).map((_, i) => i + 1)
  let stars = 0
  let hovered_index = 0

  onMount(() => {
    const params = {}
    new URLSearchParams(window.location.search).forEach((v,k) => params[k] = v)
    const search_query_params = decode_search_query(params)
    if (search_query_params['stars']) stars = search_query_params['stars']
  })

  function on_star_select(index) {
    if (stars === index) stars = 0
    else stars = index
    on_submit(stars)
  }
  function on_mouseover(index) {
    hovered_index = index
  }
  function on_mouseleave(index) {
    hovered_index = 0
  }
  function on_focus() {
    focus.stack('search:stars')
  }
  function on_blur() {
    focus.reset('thumbnail_grid')
  }

</script>

<div>
  <h4>Stars</h4>
  {#each stars_indexes as index}
    <button
      class="star"
      class:hovered={hovered_index >= index && stars < index}
      on:focus={on_focus}
      on:blur={on_blur}
      on:mouseover={() => on_mouseover(index)}
      on:mouseleave={() => on_mouseleave(index)}
      on:click={() => on_star_select(index)}>
      {#if stars >= index}
        ★
      {:else}
        ☆
      {/if}
    </button>
  {/each}
</div>

<style>
.star {
  cursor: pointer;
  border: none;
  background: none;
}
.hovered {
  /* border: 1px solid white; */
  text-shadow: 0 0 1px rgb(0 0 0 / 80%);
  /* font-weight: 900; */
  /* color: white; */
}
</style>
