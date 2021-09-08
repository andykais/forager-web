<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'

  export let on_tag_select
  export let focus = false
  export let tag_search_input = ''
  $: focus = show_suggestions
  // on_tag_select (so we can trigger a search/add tag when its been selected)
  // bind:value (so we can clear the tag input from the outside)
  // bind:focus (so we can enable/disable media keyboard shortcuts during focus)

  let tags = []
  onMount(async () => {
    loading_tags = true
    tags = await client.tag.list()
    tags.sort((a, b) => a.group.localeCompare(b.group))
    loading_tags = false
  })
  let loading_tags = false
  let show_suggestions = false
  let suggested_tags = []
  /* let tag_search_input = '' */
  let invalid_tag_error = null
  const max_suggestions = 10

  $: handle_tag_input(tag_search_input)

  function handle_tag_input(search_str) {
    console.log('handle_tag_input', search_str)
    if (loading_tags) return
    const search_terms = search_str.split(/ +/)
    let tag_name = ''
    let tag_group = ''
    if (search_terms.length === 0) {
      suggested_tags = tags.split(0, max_suggestions)
      return
    }

    const current_search_term = search_terms[search_terms.length - 1].split(':')
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
    suggested_tags = new_suggestions
  }
  const handle_select_suggestion = (tag_str) => () => {
    const split = tag_search_input.split(/[ ]+/)
    split[split.length - 1] = tag_str
    tag_search_input = split.join(' ')
  }
  function on_focus() {
    show_suggestions = true
    handle_tag_input(tag_search_input)
  }
  function on_blur() {
    show_suggestions = false
  }
  function on_submit(e) {
    e.preventDefault()
    console.log('on submit')
  }
</script>

<div id="tags">
  <h4>Tags</h4>
  <form action="submit" on:submit={on_submit}>
    <input
      class:invalid-tag={invalid_tag_error}
      type="text"
      list="tags"
      bind:value={tag_search_input}
      on:focus={on_focus}
      on:blur={on_blur}
    />
    <div class="suggestions-container">
      <div class="suggestions" class:hide={!show_suggestions || suggested_tags.length === 0}>
        {#each suggested_tags as tag}
          <div
            on:click={handle_select_suggestion(`${tag.group}:${tag.name}`)}
            class="suggestion"
            style="color: {tag.color}"
          >
            {tag.group}:{tag.name}
          </div>
        {/each}
      </div>
    </div>
  </form>
  <div>
    {#if invalid_tag_error}
      <span><span class="invalid-tag-error-msg">{invalid_tag_error}</span> is not a valid tag</span>
    {/if}
  </div>
</div>

<style>
  #tags {
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
  .suggestions.hide {
    /* display: none seems to interfere with on:click callbacks */
    opacity: 0;
  }
  .suggestion {
    padding: 2px;
    background: white;
  }
  .suggestion:hover {
    padding: 1px 2px;
    background-color: rgba(0, 0, 0, 0.1);
    border-top: 1px solid blue;
    border-bottom: 1px solid blue;
  }
</style>
