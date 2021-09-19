<script lang="ts">
  import { client } from '../../client'
  import { KeyboardShortcuts } from '../../keyboard-shortcuts'
  import { focus } from '../../stores/focus'

  export let name
  export let on_submit
  export let input = ''

  let input_element
  let current_suggestion_index = null
  let suggestions_elements = []
  let throttled = false
  let search_results = []

  $: {
    if (input_element && $focus === `${name}:tag:input`) input_element.focus()
    if ([`${name}:tag:input`, `${name}:tag:suggestion`].includes($focus)) {
      keyboard_shortcuts.enable()
    } else {
      keyboard_shortcuts.disable()
    }
  }

  async function on_input(e) {
    // FWIW this wont handle a user editing a tag further back
    // we could do something more complicated like check the diff location between old input & new input
    const input_tags = parse_input(input, null)
    const selected_tags = input_tags.slice(0, -1)
    const current_input = input_tags.at(-1)
    if(!throttled) {
      throttled = true
      search_results = await client.tag.search({ name: '', ...current_input, filter: selected_tags })
      throttled = false
    }
  }
  function on_select_suggestion(suggestion) {
    // for some reason clicking enter inside the input while there are suggestions present will trigger on click for the button so we need to ignore that click
    if ($focus === `${name}:tag:input`) return 
    input = input.substr(0, input.lastIndexOf(' ') + 1) + render_display_name(suggestion)
    input_element.focus()
    search_results = []
  }

  function on_focus_suggestion(e) {
    focus.stack(`${name}:tag:suggestion`)
  }
  function on_blur_suggestion(e) {
    focus.pop(`${name}:tag:suggestion`)
    if (e.relatedTarget?.className.split(' ').includes('suggestion') === false) {
      search_results = []
    }
  }

  function on_focus(e) {
    focus.stack(`${name}:tag:input`)
  }
  function on_blur(e) {
    focus.pop(`${name}:tag:input`)
    if (e.relatedTarget?.className.split(' ').includes('suggestion') === false) {
      search_results = []
    }
  }

  function handle_submit(e) {
    e.preventDefault()
    on_submit(parse_input(input))
  }

  function parse_input(input, group_default = '') {
    return input.split(/ +/)
      .filter(str => str.length)
      .map(str => {
        let group = group_default
        let name = str
        if (str.includes(':')) [group, name] = str.split(':')
        return { group, name }
      })
  }
  function render_display_name({ group, name }) {
    if (group) return `${group}:${name}`
    else return name
  }
  const keyboard_shortcuts = new KeyboardShortcuts({
    Escape: (e) => {
      console.log('Tag Escape triggered')
      e.preventDefault()
      search_results = []
      input_element.blur()
    },
    // NOTE we could add another handler in KeyboardShortcuts for PrevSuggestion, NextSuggestion. Its redundant though
    NextTagSuggestion: (e) => {
      e.preventDefault()
      if(suggestions_elements.length === 0) return
      if(current_suggestion_index === null) current_suggestion_index = 0
      else current_suggestion_index = (current_suggestion_index + 1) % suggestions_elements.length
      suggestions_elements[current_suggestion_index].focus()
    },
    PrevTagSuggestion: (e) => {
      e.preventDefault()
      if(suggestions_elements.length === 0) return
      if(current_suggestion_index === null) current_suggestion_index = 0
      current_suggestion_index  = (suggestions_elements.length + (current_suggestion_index - 1)) % suggestions_elements.length
      suggestions_elements[current_suggestion_index].focus()
    }
  })
</script>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<div class="container">
  <form action="submit" on:submit={handle_submit}>
    <input type="text" bind:value={input} bind:this={input_element} on:input={on_input} on:focus={on_focus} on:blur={on_blur}>
    <div class="suggestions-container">
      {#each search_results as suggestion, suggestion_index}
        <button
          class="suggestion"
          on:click={() => on_select_suggestion(suggestion)}
          on:focus={() => on_focus_suggestion(suggestion_index)}
          on:blur={() => on_blur_suggestion(suggestion_index)}
          bind:this={suggestions_elements[suggestion_index]}
          style="color: {suggestion.color}">
          <span>{render_display_name(suggestion)}</span>
          <span>{suggestion.media_reference_count}</span>
        </button>
      {/each}
    </div>
  </form>
</div>

<style>
  .container {
    z-index: 99;
    width: 100%;
    position: relative;
  }
  input {
    width: calc(100% - 8px);
  }
  .suggestions-container {
    position: absolute;
    width: 100%;
  }
  .suggestion {
    display: block;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .suggestion:hover {
    text-decoration: underline;
  }
</style>
