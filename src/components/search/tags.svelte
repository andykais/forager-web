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

  let decoded_from_url = false

  $: {
    if (!decoded_from_url && tags_query.tags) {
      console.log('initting', tags_query)
      input_value = tags_query.tags.map(tag => search_engine.encode_tag(tag)).join(' ')
      decoded_from_url = true
    }
  }

  let input_value: string = ''
  let input_tags: string[] = []
  let tag_search_completion: TagDataTR[] = []
  /* let keyboard_shortcuts: KeyboardShortcuts */

  let input_element: HTMLInputElement
  new KeyboardShortcuts(config, 'media_list', {
    FocusSearchTag: () => {
      input_element.focus()
      input_shortcuts.focus()
    },
  })
  new KeyboardShortcuts(config, 'media_view', {
    FocusSearchTag: () => {
      input_element.focus()
      input_shortcuts.focus()
    },
  })
  const input_shortcuts = new KeyboardShortcuts(config, 'search:tag:input', {
    Close: () => {
      input_element.blur()
      input_shortcuts.remove_focus()
      tag_search_completion = []
    },
    NextTagSuggestion,
    PrevTagSuggestion,
    Enter: () => {
      console.log('enter??')
      const tags = input_value
        .split(/[ ]+/)
        .filter(v => v.length > 0)
        .map(tag => search_engine.decode_tag(tag))
      tag_search_completion = []
      on_submit({ tags })
      input_shortcuts.remove_focus()
      input_element.blur()
    }
  })


  let suggestion_choice_index: null | number = null
  let suggestions_elements: HTMLButtonElement[] = []
  const suggestions_shortcuts = new KeyboardShortcuts(config, 'search:tag:suggestions', {
    Close: () => {
      tag_search_completion = []
      suggestions_shortcuts.remove_focus()
    },
    NextTagSuggestion,
    PrevTagSuggestion,
  })

  function NextTagSuggestion() {
    if (suggestion_choice_index === null) suggestion_choice_index = 0
    else suggestion_choice_index = (suggestion_choice_index + 1) % tag_search_completion.length
    suggestions_elements[suggestion_choice_index].focus()
  }
  function PrevTagSuggestion() {
    if (suggestion_choice_index === null) suggestion_choice_index = tag_search_completion.length - 1
    else suggestion_choice_index = (tag_search_completion.length + (suggestion_choice_index - 1)) % tag_search_completion.length
    suggestions_elements[suggestion_choice_index].focus()
  }


  async function search_tag_completion(tag_str: string) {
    tag_search_completion = await client.tag.search({
      ...search_engine.decode_tag(tag_str),
      group: undefined,
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
    tag_search_completion = []

    const encoded_tag = search_engine.encode_tag_row(tag)
    if (input_value && input_value.endsWith(' ') === false) {
      input_value = input_value.replace(/[^ ]+$/, '')
    }
    if (input_value) input_value += ' ' + encoded_tag
    else input_value = encoded_tag
    input_element.focus()
    input_shortcuts.focus()
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
          class:bg-slate-300={suggestion_choice_index === suggestion_index}
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
