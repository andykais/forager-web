<script lang="ts">
  import { client } from '../../client'

  export let FOCUS
  export let name
  export let on_submit

  let input = ''
  let input_element
  let current_suggestion_index = null
  let suggestions_elements = []
  let throttled = false
  let search_results = []

  async function on_input(e) {
    // FWIW this wont handle a user editing a tag further back
    // we could do something more complicated like check the diff location between old input & new input
    const input_tags = parse_input(input)
    const selected_tags = input_tags.slice(0, -1)
    const current_input = input_tags.at(-1)
    if(!throttled) {
      throttled = true
      search_results = await client.tag.search({ ...current_input, filter: selected_tags })
      console.log(search_results)
      throttled = false
    }
  }
  function on_select_suggestion(suggestion) {
    console.log('on_select_suggestion')
    input = input.substr(0, input.lastIndexOf(' ') + 1) + render_display_name(suggestion)
    input_element.focus()
    search_results = []
  }

  function on_focus_suggestion(e) {
    console.log('on_focus_suggestion')
    FOCUS = `${name}:tag_suggestion`
  }
  function on_blur_suggestion(e) {
    console.log('on_blur_suggestion')
  // UNDO w/ store
    /* FOCUS = `${name}:tag_suggestion` */
  }

  function on_focus(e) {
    console.log('focus?')
    FOCUS = `${name}:tag`
  }

  function handle_submit(e) {
    console.log('handle?')
    e.preventDefault()
    on_submit(parse_input(input))
  }

  function parse_input(input: sting) {
    return input.split(/ +/).map(str => {
      let group = ''
      let name = str
      if (str.includes(':')) [group, name] = str.split(':')
      return { group, name }
    })
  }
  function render_display_name({ group, name }) {
    if (group) return `${group}:${name}`
    else return name
  }
</script>

<div class="container">
  <form action="submit" on:submit={handle_submit}>
    <h4>Tags</h4>
    <input type="text" bind:value={input} bind:this={input_element} on:input={on_input} on:focus={on_focus}>
    <div class="suggestions-container" tabindex="0">
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
    z-index: 101;
    width: 100%;
    position: relative;
  }
  input {
    width: 100%;
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
