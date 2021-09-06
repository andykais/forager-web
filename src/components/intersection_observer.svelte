<script lang="ts">
  import { tick, createEventDispatcher, afterUpdate, onMount } from "svelte"

  const observer_options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.0,
  }
  const dispatch = createEventDispatcher()
  let observer: IntersectionObserver | null = null
  let element: HtmlElement | null = null

  const initialize = () => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((_entry) => {
          if (_entry.target === element) {
            if (_entry.isIntersecting) {
              dispatch('intersect', _entry)
            }
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
