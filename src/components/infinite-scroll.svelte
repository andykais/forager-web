<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'

  export let threshold = 0
  export let should_load_more = true

  const dispatch = createEventDispatcher()

  let scroll_y

  function on_scroll_y(scroll_y) {
    if (scroll_y === undefined) return
    console.log({ scroll_y })
  }

  $: on_scroll_y(scroll_y)
</script>

<svelte:window bind:scrollY={scroll_y} />
