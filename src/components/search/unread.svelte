<script lang="ts">
  import type { UnreadQuery } from './types'

  export let on_submit: (unread_query: UnreadQuery) => void
  let unread = false

  function handle_input() {
    unread = !unread
    on_submit({ unread })
  }

</script>


<div class="flex items-center gap-2 text-gray-800">
  <h5>Unread</h5>
  <input class="accent-lime-500" type="checkbox" on:input={handle_input} checked={unread}>
</div>
