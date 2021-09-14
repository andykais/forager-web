<script lang="ts">
  import { client } from '../client'
  import TagSearch from './search/tags.svelte'
  export let loading = false
  export let tags = []
  export let media_reference
  export let focus = false
  /* export let new_tag_focus = false */

  export function focus_me() {
    console.log('media-reference focus_me')
    tag_search_el.focus_me()
  }
  /* $: { */
  /*   console.log({ new_tag_focus }) */
  /* } */

  let tag_search_el
  let new_tag_input = ''
  let add_tag_focus
  let tag_group_map = {}
  let tag_groups = []
  let sidebar_width

  $: focus = add_tag_focus

  $: {
    tag_group_map = tags.reduce((acc, tag) => {
      acc[tag.group] = acc[tag.group] ?? []
      acc[tag.group].push(tag)
      return acc
    }, {})
    tag_groups = Object.keys(tag_group_map)
    tag_groups.sort((a, b) => a.localeCompare(b))
  }

  async function on_add_new_tags(add_tag) {
    tags = await client.tag.add_tags(media_reference.id, add_tag)
    new_tag_input = ''
  }
  async function remove_tag(remove_tag) {
    const { name, group } = remove_tag
    tags = await client.tag.remove_tags(media_reference.id, [{ name, group }])
  }
</script>

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
        <input id="metadata" type="text" value={media_reference?.metadata} />
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
              <button on:click={() => remove_tag(tag)}>X</button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div>
      <label for="">Add New Tags</label>
      <div id="new-tags">
        <TagSearch
          bind:this={tag_search_el}
          hide_label={true}
          allow_multiple={false}
          allow_new_tags={true}
          bind:input={new_tag_input}
          bind:focus={add_tag_focus}
          on_submit={on_add_new_tags}
        />
        <button><h3>+</h3></button>
      </div>
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
    grid-template-columns: 1fr auto;
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
  }
  .tag-name {
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
  #new-tags {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-gap: 10px;
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
</style>
