<script lang="ts">
  import { client } from '../client'
  import { onMount } from 'svelte'

  let mounted = false
  let group_input = undefined
  let toggleable_group_input = undefined
  let use_group = false
  let name_input = ''
  $: toggleable_group_input = group_input

  let sort_by = 'media_reference_count'
  let sort_desc = true

  let query = {}
  $: query = {
    sort_by,
    order: sort_desc ? 'desc' : 'asc',
    group: toggleable_group_input,
    name: name_input,
    limit: 2000,
  }
  $: {
    if (mounted) {
      console.log({ query })
      client.tag.search(query).then(res => {
        search_results = res
      })
    }
  }
  onMount(() => { mounted = true })

  let search_results = []

  function handle_group_input(e) {
    use_group = true
  }
  async function handle_use_group_checkbox(e) {
    console.log('handle_use_group_checkbox', { use_group })
    if (use_group) {
      use_group = false
      toggleable_group_input = undefined
    } else {
      use_group = true
      toggleable_group_input = group_input
    }
  }
  function handle_name_input(e) {
  }
  async function handle_select_sort_by(e) {
    sort_by = e.target.value
  }
  async function handle_toggle_sort_order(e) {
    sort_desc = !sort_desc
  }

</script>

<div class='grid'>
  <div class="cell">
    <label for="group">Group</label>
    <div class="group-inputs">
      <input name="group" bind:value={group_input} on:input={handle_group_input} >
      <input type="checkbox" checked={use_group} on:input={handle_use_group_checkbox}>
    </div>
  </div>
  <div class="cell">
    <label for="name">Name</label>
    <input name="name" bind:value={name_input} on:input={handle_name_input} autocomplete="off" >
  </div>

  <div class="cell">
    <label for="sort">Sort By</label>
    <select id="sort" name="sort" value={sort_by} on:input={handle_select_sort_by}>
      <option value="created_at">Created At</option>
      <option value="updated_at">Updated At</option>
      <option value="media_reference_count">Media Reference Count</option>
      <option value="unread_media_reference_count">Unread Media Reference Count</option>
    </select>
    <button on:click={handle_toggle_sort_order}>{#if sort_desc}↑{:else}↓{/if}</button>
  </div>

  <div class="search-results">
    <table>
      <tr>
        <th>Tag</th>
        <th>Media Reference Count</th>
        <th>Unread Media Reference Count</th>
      </tr>
      {#each search_results as tag}
        <tr class="tag-result">
          <td style="width: 40%">{tag.group}:{tag.name}</td>
          <td>{tag.media_reference_count}</td>
          <td>{tag.unread_media_reference_count}</td>
        </tr>
      {/each}
    </table>
  </div>
</div>

<style>
  .grid {
    width: 100%;
    margin: 5% 10%;
  }
  .cell {
    width: 90%;
  }
  .cell input {
    width: 100%;
  }
  label {
    display: block;
  }
  .group-inputs {
    display: grid;
    grid-template-columns: 1fr 50px;
  }
  .search-results {
    margin-top: 30px;
  }
  .tag-result {
    border-bottom: 1px solid black;
  }
</style>
