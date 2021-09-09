<script lang="ts">
  let stars = 0

  export let on_submit
  export let focus = false

  const handle_star_select = (index) => () => {
    if (stars === index) stars = 0
    else stars = index
    on_submit(stars)
  }

  const stars_indexes = Array(5)
    .fill(0)
    .map((_, i) => i + 1)
</script>

<div>
  <h4>Stars</h4>
  {#each stars_indexes as index}
    <span class="star" on:click={handle_star_select(index)}>
      {#if stars >= index}
        ★
      {:else}
        ☆
      {/if}
    </span>
  {/each}
</div>

<style>
.star {
  cursor: pointer;
}
</style>
