<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'

  let tags = []
  onMount(async () => {
    tags = await client.tag.list()
    tags.sort((a, b) => a.group.localeCompare(b.group))
    mounted = true
  })
  let mounted = false
  let suggested_tags = []
  let tag_search_input = ''
  let invalid_tag_error = null

  $: handle_tag_input(tag_search_input)
  function handle_tag_input(search_str) {
    console.log('handle_tag_input', { search_str })
    if (mounted === false) return
    invalid_tag_error = null
    const search_terms = tag_search_input.split(/[ ]+/).filter(v => v.length).map(search_term => {
      const split = search_term.split(':')
      let group = null
      let name = null
      if (split.length === 1) {
        name = split[0]
      } else if (split.length === 2) {
        group = split[0]
        name = split[1]
      } else {
        if (!invalid_tag_error) invalid_tag_error = `"${search_term}"`
      }
      if (name === '') name = null
      return { group, name }
    })
    if (search_terms.length === 0) {
      console.log('set em to', tags)
      suggested_tags = tags
      return
    }
    const current_search_term = search_terms[search_terms.length - 1]
    console.log({ current_search_term })
    if (current_search_term.group === null  && current_search_term.name === null) {
      suggested_tags = tags
    } else {
      suggested_tags = tags.filter(t => {
        if (current_search_term.group === null) {
          if (!t.name.startsWith(current_search_term.name)) return false
        } else {
          if (current_search_term.name === null) {
            if (!t.group.startsWith(current_search_term.group)) return false
          } else {
            if (t.group !== current_search_term.group) return false
            if (!t.name.startsWith(current_search_term.name)) return false
          }
        }
        return true
      })
    }
  }
  $: console.log({ suggested_tags })
</script>

<div class="container">
  <div id="tags">
    <h4>Tags</h4>
    <div id="tag-input-container">
      <input class:invalid-tag={invalid_tag_error} bind:value={tag_search_input} type="text">
      {suggested_tags}
      {#if !invalid_tag_error}
        <div id="tag-suggestions">
          {#each suggested_tags as tag}
            <span>{tag.group}:{tag.name}</span>
          {/each}
        </div>
      {/if}
    </div>
    {#if invalid_tag_error}
      <span><span class="invalid-tag-error-msg">{invalid_tag_error}</span> is not a valid tag</span>
    {/if}
  </div>

  <div>
    <h4>Stars</h4>
    <span>★ ★ ★ ☆ ☆</span>
  </div>

  <div>
    <h4>Sort</h4>
    <select id="sort" name="sort">
      <option value="Added On">Added On</option>
      <option value="Created At">Created At</option>
      <option value="Modified On">Modified On</option>
    </select>
    <span>↑ ↓</span>
  </div>
</div>

<style>
  #tags {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
  }
  #tag-input-container {
    width: 100%;
  }
  #tag-input-container > input {
    width: -webkit-fill-available;
  }
  .container {
    display:  grid;
    grid-template-columns: 1fr auto auto;
    grid-gap: 20px;
  }

  .invalid-tag {
    border: 2px solid red;
    border-radius: 5px;
    outline-color: red;
  }
  .invalid-tag-error-msg {
    border-radius: 2px;
    padding: 0 5px;
    background-color: rgba(255, 0,0,0.2);
    width: 100%;
  }
</style>
