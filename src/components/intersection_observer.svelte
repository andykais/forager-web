<script lang="ts">
  import { createEventDispatcher, afterUpdate, onMount } from "svelte"

  export let focused: boolean
  let state: 'intersecting' | 'above' | 'below' = 'intersecting'
  const observer_options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.0,
  }
  const dispatch = createEventDispatcher()
  let observer: IntersectionObserver | null = null
  let element: HTMLElement | null = null
  $: {
    if (focused) scroll_into_view()
  }
  function scroll_into_view() {
  /* console.log('scroll_into_view', state) */
    if (element && state !== 'intersecting') {
      const options = {inline: 'nearest', block: state === 'above' ? 'start' : 'end'} as const
      /* const align_to_top = state === 'above' */
      element.scrollIntoView(options)
    }
  }
  const initialize = () => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((_entry) => {
          if (_entry.target === element) {
            if  (_entry.isIntersecting) {
              state = 'intersecting'
              dispatch('intersect', _entry)
            } else if (_entry.boundingClientRect.top > 0) {
              state = 'below'
            } else {
              state = 'above'
            }
            /* if  (focused) console.log({ top: _entry.boundingClientRect.top, state }) */
          }
        });
      },
      observer_options
    );
  };
  onMount(() => {
    initialize();
    return () => {
      if (observer) observer.disconnect();
    };
  });
  afterUpdate(async () => {
    if (element) {
      observer.observe(element);
    }
  });
</script>

<div bind:this={element}>
  <slot />
</div>
