<script lang="ts">
  import * as date_fns from 'date-fns'
  import { KeyboardShortcuts } from '../keyboard-shortcuts'
  import { client } from '../client'
  import TagSearch from './search/tags-ss.svelte'
  import { focus } from '../stores/focus'

  export let loading = false
  export let tags = []
  export let media_reference

  let new_tag_input = ''
  let tag_group_map = {}
  let tag_groups = []
  let sidebar_width
  let source_created_ago

  $: source_created_ago = media_reference?.source_created_at
    ? `Created ${date_fns.formatDistanceToNow(new Date(media_reference.source_created_at))} ago`
    : 'Unknown create date'

  $: {
    tag_group_map = tags.reduce((acc, tag) => {
      acc[tag.group] = acc[tag.group] ?? []
      acc[tag.group].push(tag)
      return acc
    }, {})
    tag_groups = Object.keys(tag_group_map)
    tag_groups.sort((a, b) => a.localeCompare(b))
  }
  $: {
    if ($focus === 'media_file:fullscreen') keyboard_shortcuts.disable()
    else keyboard_shortcuts.enable()
  }

  async function on_add_new_tags(add_tag) {
    tags = await client.tag.add_tags(media_reference.id, add_tag)
    new_tag_input = ''
  }
  async function remove_tag(remove_tag) {
    const { name, group } = remove_tag
    tags = await client.tag.remove_tags(media_reference.id, [{ name, group }])
  }
  const keyboard_shortcuts = new KeyboardShortcuts({
    FocusNewTag: (e) => {
      e.preventDefault()
      focus.stack('media_reference:tag')
    }
  })
</script>

<svelte:window on:keydown={keyboard_shortcuts.handler} />

<div id="media-tag-viewer">
  <div id="container" bind:clientWidth={sidebar_width}>
    <div id="media-info">
      <div class="crud-input">
        <label for="title">Title</label>
        <input id="title" type="text" value={media_reference?.title} />
      </div>
      <div class="crud-input">
        <label for="description">Description</label>
        <input id="description" type="text" value={media_reference?.description} />
      </div>
      <div class="crud-input">
        <label for="metadata">Description</label>
        <input id="metadata" type="text" value={JSON.stringify(media_reference?.metadata)} />
      </div>
      <div>
        <span>{source_created_ago}</span>
      </div>
      <div>
        <span>Stars: {media_reference?.stars}</span>
      </div>
    </div>
    <div id="tags" style="width: {sidebar_width}px">
      {#each tag_groups as group}
        <div class="group">
          <h4>{group}</h4>
          <div class="tag-container">
            {#each tag_group_map[group] as tag}
              <button class="tag" style="background-color: {tag.color}">
                <span class="tag-name" title={tag.name}>{tag.name}</span>
                <span>{tag.media_reference_count}</span>
              </button>
              <!-- TODO on hover show these buttons -->
              <button class="flip-text" on:click={() => remove_tag(tag)}>✎</button>
              <button on:click={() => remove_tag(tag)}>📋</button>
              <button on:click={() => remove_tag(tag)}>X</button>
            {/each}
          </div>
        </div>
      {/each}
      <div id="new-tag">
        <TagSearch
          allow_multiple={false}
          name="media_reference"
          bind:input={new_tag_input}
          on_submit={on_add_new_tags}
        />
        <button><h3>+</h3></button>
      </div>
    </div>
    <div>
    </div>
  </div>
</div>

<style>
  #media-tag-viewer {
z-index: 101;
    padding: 5px;
    background-color: var(--secondary-bg-color);
    box-shadow: 0 3px 2px -2px rgba(0, 0, 0, 0.5);
    border-right: 3px solid white;
    width: calc(100% - 13px);
    overflow-y: scroll;
  }
  #container {
    display: grid;
    /* grid-template-rows: auto 1fr auto; */
    grid-template-rows: auto auto auto 1fr;
    grid-gap: 30px;
    height: 100%;
    /* display: flex; */
    /* flex-direction: column; */
    /* width: 100%; */
    width: calc(100% - 10px);
  }
  #media-info {
  }
  .crud-input {
    display: flex;
    width: 100%;
    flex-direction: column;
  }
  #tags {
    width: 100%;
  }
  .group {
    margin-bottom: 5px;
    width: 100%;
  }
  .tag-container {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    grid-gap: 5px;
  }
  .tag {
    box-shadow: 0 1px 1px 1px rgba(0, 0, 0, 0.2);
    border: none;
    outline: none;
    width: 100%;
    text-align: left;
    border-radius: 5px;
    display: flex;
    margin-bottom: 2px;
    justify-content: space-between;
    align-items: center;
  }
  .tag-name {
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  #new-tag {
    margin-top: 10px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-gap: 5px;
    align-items: center;
    width: 100%;
  }
  #new-tags button h3 {
    padding: 0 2px;
  }
  #new-tags > div {
    background-color: red;
    width: 100%;
  }
  .flip-text {
    -webkit-transform:rotateY(180deg);
    -moz-transform:rotateY(180deg);
    -o-transform:rotateY(180deg);
    -ms-transform:rotateY(180deg);
  }
</style>
