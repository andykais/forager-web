<script lang="ts">
  import  { client }  from '../../client'
  import { search_engine } from '../../stores/search'
  import type { TagsQuery } from './types'
  import type { TagDataTR } from 'forager/src/models/tag'
  import { KeyboardShortcuts } from '../../keyboard_shortcuts'
  import type { Config } from '../../config'

  export let config: Config
  export let tags_query: TagsQuery = {}
  export let on_submit: (tags_query: TagsQuery) => void

  let input_value: string = ''
  let input_tags: string[] = []
  let tag_search_completion: TagDataTR[] = []
  /* let keyboard_shortcuts: KeyboardShortcuts */

  let input_element: HTMLInputElement
  const input_shortcuts = new KeyboardShortcuts(config, 'search:tag:input', {
    FocusSearchTag: () => {
      input_element.focus()
      input_shortcuts.focus()
    },
    Close: () => {
      console.log('close')
      input_element.blur()
      input_shortcuts.remove_focus()
    }
  })


  let suggestions_elements: HTMLButtonElement[] = []
  const suggestions_shortcuts = new KeyboardShortcuts(config, 'search:tag:suggestions', {
    NextTagSuggestion: () => {
    },
    PrevTagSuggestion: () => {
    }
  })


import { onMount, onDestroy } from 'svelte'
onMount(async () => {
  /* keyboard_shortcuts = new KeyboardShortcuts(config) */
  /* keyboard_shortcuts.on_focus(() => { */
  /*   console.log('focus me please') */
  /* }) */
  search_tag_completion('') // temp debugging
})
/* onDestroy(() => { */
/*   keyboard_shortcuts?.close() */
/* }) */

  async function search_tag_completion(tag_str: string) {
    tag_search_completion = await client.tag.search({
      ...search_engine.decode_tag(tag_str),
      order: 'desc',
      sort_by: 'updated_at',
      limit: 5,
    })
  }

  async function handle_input(value: string, cursor_position: number) {
    input_value = value

    let search_str_start_index = value.slice(0, cursor_position).lastIndexOf(' ')
    if (search_str_start_index === -1) search_str_start_index = 0
    else search_str_start_index ++
    const search_str = value.slice(search_str_start_index).split(' ', 1)[0]
    await search_tag_completion(search_str)
  }

  function handle_suggest_tag(tag: TagDataTR) {

  }
</script>


<div class="relative">
  <input
    class="px-4 py-1 w-full rounded-xl focus:outline-lime-700 text-sm leading-6 text-slate-100 bg-gray-700 z-10"
    type="text"
    placeholder="foo bar:baz ..."
    on:input={e => handle_input(e.currentTarget.value, e.currentTarget.selectionStart)}
    on:focus={() => input_shortcuts.focus()}
    on:blur={() => input_shortcuts.remove_focus()}
    value={input_value}
    bind:this={input_element}>
    <div class="relative -z-0 mx-2">
    <div class="absolute w-full bg-slate-400 border-b-[1px] border-slate-700 border-x-[2px] rounded-b-sm">
      {#each tag_search_completion as suggestion, suggestion_index}
        <button
          class="block w-full px-2 flex justify-between border-b-[1px] border-slate-500 hover:bg-slate-300"
          on:click={() => handle_suggest_tag(suggestion)}
          on:focus={() => suggestions_shortcuts.focus()}
          on:blur={() => suggestions_shortcuts.remove_focus()}
          bind:this={suggestions_elements[suggestion_index]}
          style="color: {suggestion.color}">
          <span>{suggestion.name}</span>
          <span>{suggestion.media_reference_count}</span>
        </button>
      {/each}
    </div>
    </div>
</div>
