<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { client } from '../client'

  export let on_submit
  export let input
  export let focus = false

  onMount(async () => {
    await load_tags()
  })

  let loading_tags = false
  let tags = []
  let tag_ids_map = {}
  let tag_display_names_map = {}
  let input_tag_ids = []
  let invalid_tag_error = null
  let input_element
  let input_suggestions = []
  let max_suggestions = 10
  let show_suggestions = false
  $: show_suggestions = show_suggestions && input_suggestions.length > 0

  async function load_tags() {
    loading_tags = true
    tags = await client.tag.list()
    tags.sort((a, b) => b.media_reference_count - a.media_reference_count)
    tag_ids_map = tags.reduce((acc, tag) => {
      acc[tag.id] = tag
      return acc
    }, {})
    tag_display_names_map = tags.reduce((acc, tag) => {
      const display_name = `${tag.group}:${tag.name}`
      acc[display_name] = tag
      return acc
    }, {})
    loading_tags = false
  }

  function find_tag_suggestions(partial_tag_name) {
    if (loading_tags) return
    let tag_name = ''
    let tag_group = ''
    const current_search_term = partial_tag_name.split(':')
    if (current_search_term.length === 1) tag_name = current_search_term[0]
    else if (current_search_term.length === 2) {
      tag_group = current_search_term[0]
      tag_name = current_search_term[1]
    } else {
      invalid_tag_error = current_search_term
      return
    }

    const new_suggestions = []
    for (let i = 0; i < tags.length && new_suggestions.length < max_suggestions; i++) {
      const tag = tags[i]
      if (tag_group.length === 0 && tag_name.length === 0) {
        new_suggestions.push(tag)
      } else if (tag_group.length === 0) {
        if (tag.name.startsWith(tag_name)) new_suggestions.push(tag)
      } else if (tag_name.length === 0) {
        if (tag.group.startsWith(tag_group)) new_suggestions.push(tag)
      } else {
        if (tag.group === tag_group) {
          if (tag.name.startsWith(tag_name)) new_suggestions.push(tag)
        }
      }
    }
    input_suggestions = new_suggestions
    show_suggestions = true

  }
  async function on_input() {
    if (input.length === 0) return find_tag_suggestions('')
    if (input[input.length - 1] === ' ') return find_tag_suggestions('')
    const split = input.split(/[ ]+/).filter(str => str.length)
    const last = split.pop()

    input_tag_ids = split.map(str => {
      const matching_tag = tag_display_names_map[str]
      // TODO handle an "accept_nonexistent_tags" flag
      if (matching_tag) return matching_tag.id
      else invalid_tag_error = `${str} does not exist`
    })
    if (tag_display_names_map[last]) {
      input_tag_ids.push(tag_display_names_map[last].id)
      show_suggestions = false
    }
    else find_tag_suggestions(last)
  }

  function on_focus() {
    on_input()
    focus = true
  }
  function on_blur() {
    focus = false
  }
  function handle_submit(e) {
    e.preventDefault()
    on_submit(input_tag_ids)
  }
  const handle_select_suggestion = (tag_id) => () => {
    const selected_tag = tag_ids_map[tag_id]
    const split = input.split(/ +/)
    split[split.length - 1] = `${selected_tag.group}:${selected_tag.name}`
    input = split.join(' ')
    input_element.focus()
  }
</script>

<div class="tag-search">
  <h4>Tags</h4>
  <form action="submit" on:submit={handle_submit}>
    <input
      class:invalid-tag={invalid_tag_error}
      type="text"
      bind:value={input}
      bind:this={input_element}
      on:focus={on_focus}
      on:blur={on_blur}
      on:input={on_input}
    />
    <div class="suggestions-container">
      {#if show_suggestions}
        <div class="suggestions">
          {#each input_suggestions as tag}
            <div on:click={handle_select_suggestion(tag.id)} class="suggestion">
              <span style="color: {tag.color}">{tag.group}:{tag.name}</span>
              <span>{tag.media_reference_count}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </form>
  <div>
    {#if invalid_tag_error}
      <span><span class="invalid-tag-error-msg">{invalid_tag_error}</span> is not a valid tag</span>
    {/if}
  </div>
</div>

<style>
  .tag-search {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
  }
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  input {
    width: -webkit-fill-available;
    border-radius: 5px;
  }
  .invalid-tag {
    border: 2px solid red;
    border-radius: 5px;
    outline-color: red;
  }
  .invalid-tag-error-msg {
    border-radius: 2px;
    padding: 0 5px;
    background-color: rgba(255, 0, 0, 0.2);
    width: 100%;
  }
  .suggestions-container {
    position: relative;
    width: calc(100% - 5px);
  }
  .suggestions {
    top: -1px;
    position: absolute;
    width: calc(100% - 2px);
    background: white;
    border: solid 1px black;
  }
  .suggestion {
    padding: 2px;
    background: white;
    display: grid;
    grid-template-columns: 1fr auto;
  }
  .suggestion:hover {
    padding: 1px 2px;
    background-color: rgba(0, 0, 0, 0.1);
    border-top: 1px solid blue;
    border-bottom: 1px solid blue;
  }
</style>
