<script lang="ts">
  import { createEventDispatcher, afterUpdate, onMount } from "svelte"

  export let focused: boolean
  export let refreshed_at = 0
  let state: 'intersecting' | 'above' | 'below' = 'intersecting'
  let last_state_change_at = Date.now()
  $: {
    // Sometimes the elements inside a intersection observer change, but the intersection observer isnt remounted
    // (e.g. in the case of a list of intersection observers)
    // To deal with this, we pass in a refreshed_at integer that _does_ update when we update the elements inside
    // the intersection observer. This lets us resend the intersection state, rather than store a fat list of
    // intersection state outside this component
    // NOTE that this might become unnecessary if we start loading thumbnails according to how many will fill a page
    if (last_state_change_at < refreshed_at) {
      if (state === 'intersecting') dispatch('intersect')
      last_state_change_at = refreshed_at
    }
  }
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
            last_state_change_at = Date.now()
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
