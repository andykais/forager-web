<script lang="ts">

  export let on_submit

  let sort_by = 'created_at'
  let sort_desc = true

  function handle_select(e) {
    sort_by = e.target.value
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
  }
  function handle_toggle() {
    sort_desc = !sort_desc
    on_submit({ sort_by, order: sort_desc ? 'desc' : 'asc' })
  }
</script>


<div>
  <h4>Sort</h4>
  <select id="sort" name="sort" value={sort_by} on:input={handle_select}>
    <option value="created_at">Added On</option>
    <option value="source_created_at">Created At</option>
    <option value="updated_at">Modified On</option>
  </select>
  <button on:click={handle_toggle}>{#if sort_desc}↑{:else}↓{/if}</button>
</div>
