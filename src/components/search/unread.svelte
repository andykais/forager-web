<script lang="ts">
  import { tick } from 'svelte'

  export let on_submit

  let unread_only = false

  async function handle_input() {
    unread_only = !unread_only
    on_submit(unread_only)
  }
</script>

<div>
  <h4>News Reader Mode</h4>
  <input checked={unread_only} on:input={handle_input} type="checkbox" />
</div>
