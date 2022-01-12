<script lang="ts">
  import Icon from 'svelte-icon/index.mjs'
  import left from '../icons/zondicons/cheveron-left.svg?raw'
  import right from '../icons/zondicons/cheveron-right.svg?raw'
  import pause from '../icons/zondicons/pause.svg?raw'

  export let default_width: number
  export let classes = ""
  let width = default_width
  let state: 'hidden' | 'shown' | 'dragging' = 'hidden'
  let mouse_button_offset = 0

  let mousedown = false

  function handle_mouseup() {
    mousedown = false
    if (state === 'dragging') {}
    else if (state == 'shown') state = 'hidden'
    else state = 'shown'
  }
  function handle_window_mouseup() {
    mousedown = false
    if (state === 'dragging') state = 'shown'
  }
  function handle_mousedown(e: MouseEvent) {
    mouse_button_offset = e.offsetX
    mousedown = true
  }
  function handle_mousemove(e: MouseEvent) {
    if (mousedown) {
      state = 'dragging'
      width = e.clientX - mouse_button_offset
    }
  }
</script>

<div class="{classes} grid grid-cols-1fr-auto" >
  {#if state !== 'hidden'}
    <div style="width: {width}px">
      <slot></slot>
    </div>
  {/if}

  <button
    on:mouseup={handle_mouseup}
    on:mousedown={handle_mousedown}
    title="click to {state === 'hidden' ? 'open' : 'close'}, drag to resize"
    class="bg-gray-600 hover:bg-slate-500 border-r-2 border-x-slate-800 text-lime-600">
    {#if state === 'dragging'}
      <Icon data={pause} />
    {:else if state  === 'hidden'}
      <Icon data={right} />
    {:else}
      <Icon data={left} />
    {/if}
  </button>
</div>

<svelte:window on:mousemove={handle_mousemove} on:mouseup={handle_window_mouseup} />
