<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { client } from '../../client'

  export let on_submit
  export let input
  export let focus = false
  export let hide_label = false

  onMount(async () => {
    await load_tags()
  })

  let input_focus = false
  let suggestions_focus = false
  $: focus = input_focus || suggestions_focus
  let loading_tags = false
  let tags = []
  let tag_ids_map = {}
  let tag_display_names_map = {}
  let input_tag_ids = []
  let unknown_tag_display_names = []
  let invalid_tag_error = null
  let input_element
  let focused_suggestion_index = null
  let input_suggestions = []
  let suggestions_buttons = []
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
    focused_suggestion_index = null
    if (loading_tags) return
    let tag_name = ''
    let tag_group = ''
    const current_search_term = partial_tag_name.split(':')
    if (current_search_term.length === 1) tag_name = current_search_term[0]
    else if (current_search_term.length === 2) {
      tag_group = current_search_term[0]
      tag_name = current_search_term[1]
    } else {
      invalid_tag_error = `${partial_tag_name} is not a valid tag`
      input_suggestions = []
      return
    }

    const new_suggestions = []
    for (let i = 0; i < tags.length && new_suggestions.length < max_suggestions; i++) {
      const tag = tags[i]
      if (input_tag_ids.includes(tag.id)) continue
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
    if (new_suggestions.length === 0) {
      if (tag_group.length === 0) {
        for (let i = 0; i < tags.length && new_suggestions.length < max_suggestions; i++) {
          const tag = tags[i]
          if (tag.group.startsWith(tag_name)) new_suggestions.push(tag)
        }
      }
    }
    input_suggestions = new_suggestions
    show_suggestions = true
  }
  async function on_input() {
    invalid_tag_error = ''
    unknown_tag_display_names = []
    const split = input.split(/[ ]+/).filter(str => str.length > 0)
    input_tag_ids = []
    for (const str of split) {
        const matching_tag = tag_display_names_map[str]
        if (matching_tag) input_tag_ids.push(matching_tag.id)
        else unknown_tag_display_names.push(str)
    }

    if (input.length === 0) return find_tag_suggestions('')
    if (input[input.length - 1] === ' ') return find_tag_suggestions('')
    const last = split.pop()

    find_tag_suggestions(last)
  }

  function on_focus() {
    on_input()
    input_focus = true
  }
  function on_suggestion_focus(suggestion_index) {
    focused_suggestion_index = suggestion_index
    suggestions_buttons[focused_suggestion_index].focus()
    suggestions_focus = true
  }
  function on_suggestion_blur(e) {
    suggestions_focus = false
    if (!e.relatedTarget?.className.split(' ').includes('suggestion')) {
      show_suggestions = false
    }
  }
  async function on_blur(e) {
    input_focus = false
    if (!e.relatedTarget?.className.split(' ').includes('suggestion')) {
      // relatedTarget is the body when we select a suggestion right now because they are not elements that can capture focus
      show_suggestions = false
    }
  }
  function handle_submit(e) {
    e.preventDefault()
    if(unknown_tag_display_names.length) {
      // TODO handle an "accept_nonexistent_tags" flag
      invalid_tag_error = `${unknown_tag_display_names[0]} does not exist`
    }
    on_submit(input_tag_ids)
  }
  function on_select_suggestion(tag_id, e) {
    if (input_focus) {
      // slightly annoyed  that this even has to exist.
      // Somehow hitting enter while the input is focused is triggering the button on:click event
      handle_submit(e)
      show_suggestions = false
      return
    }
    e.preventDefault()
    const selected_tag = tag_ids_map[tag_id]
    const split = input.split(/ +/)
    split[split.length - 1] = `${selected_tag.group}:${selected_tag.name}`
    input = split.join(' ')
    input_element.focus()
    show_suggestions = false
  }
  function on_keydown(e) {
    if(focus) {
      if (show_suggestions) {
        if (e.code === 'ArrowDown') {
          e.preventDefault()
          if (focused_suggestion_index === null) focused_suggestion_index = 0
          else focused_suggestion_index = (focused_suggestion_index + 1) % suggestions_buttons.length
          suggestions_buttons[focused_suggestion_index].focus()
        } else if(e.code === 'ArrowUp') {
          e.preventDefault()
          if (focused_suggestion_index === null) focused_suggestion_index = 0
          focused_suggestion_index = (suggestions_buttons.length + (focused_suggestion_index - 1)) % suggestions_buttons.length
          suggestions_buttons[focused_suggestion_index].focus()
        } else if (e.code === 'Escape') {
          show_suggestions = false
          input_element.blur()
        }
      } else {
        show_suggestions =  true
      }
    } else {
      if(e.code === 'Slash') {
        input_element.focus()
        e.preventDefault()
        focus = true
      }
    }
  }
</script>

<svelte:window on:keydown={on_keydown} />

<div class="tag-search">
  {#if !hide_label}
    <h4>Tags</h4>
  {/if}
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
          {#each input_suggestions as tag, index}
            <button
              class="suggestion"
              class:suggestion-focused={focused_suggestion_index === index}
              bind:this={suggestions_buttons[index]}
              on:focus={() => on_suggestion_focus(index)}
              on:mouseover={() => on_suggestion_focus(index)}
              on:blur={on_suggestion_blur}
              on:click={e => on_select_suggestion(tag.id, e)}>
              <span style="color: {tag.color}">{tag.group}:{tag.name}</span>
              <span>{tag.media_reference_count}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </form>
  <div>
    {#if invalid_tag_error}
      <span><span class="invalid-tag-error-msg">{invalid_tag_error}</span></span>
    {/if}
  </div>
</div>

<style>
  .tag-search {
  }
  form {
    margin: 2px 0;
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
    z-index: 100;
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
    width: 100%;
    border: none;
    text-align: left;
    border-radius: 4px;
  }
  .suggestion-focused {
    /* border: 2px solid rgba(100, 0, 255, 0.7); */
    outline: -webkit-focus-ring-color auto 1px;
    /* background-color: rgba(0, 0, 0, 0.1); */
    /* border-top: 1px solid blue; */
    /* border-bottom: 1px solid blue; */
  }
  /* .suggestion:hover { */
  /* } */
</style>
