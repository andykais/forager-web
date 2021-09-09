<script lang="ts">
  import TagSearch from './search/tags.svelte'
  export let tags = []
  export let media_reference

  let tag_group_map = {}
  let tag_groups = []

  $: {
    tag_group_map = tags.reduce((acc, tag) => {
      acc[tag.group] = acc[tag.group] ?? []
      acc[tag.group].push(tag)
      return acc
    }, {})
    tag_groups = Object.keys(tag_group_map)
    tag_groups.sort((a,b) => a.localeCompare(b))
  }

  function on_add_new_tags(tag_ids) {
    console.log({ tag_ids })
  }
</script>

<div id="media-tag-viewer">
  <div id="container">
  <div id="media-info">
    <div class="crud-input">
      <label for="title">Title</label>
      <input id="title" type="text" value={media_reference?.title}>
    </div>
    <div class="crud-input">
      <label for="description">Description</label>
      <input id="description" type="text" value={media_reference?.description}>
    </div>
  </div>
  <div id="tags">
    {#each tag_groups as group}
      <div class="group">
        <h3>{group}</h3>
        {#each tag_group_map[group] as tag}
          <button class="tag" style="background-color: {tag.color}">
            <span>{tag.name}</span>
            <span>{tag.media_reference_count}</span>
          </button>
        {/each}
      </div>
    {/each}
  </div>
  <div id="new-tags">
    <TagSearch hide_label={true} on_submit={on_add_new_tags} />
    <button><h3>+</h3></button>
  </div>
  </div>
</div>

<style>
  #media-tag-viewer {
    padding: 5px;
    background-color: var(--secondary-bg-color);
    /* box-shadow: 0 1px 2px 1px rgba(0,0,0,0.5); */
    box-shadow: 0 3px 2px -2px rgba(0,0,0,0.5);
    border-right: 3px solid white;
    width: calc(100% - 13px);
    /* width: 100%; */
  }
  #container {
    /* margin: 5px; */
    /* display: grid; */
    /* grid-template-rows: auto 1fr auto; */
    grid-gap: 10px;
    /* width: calc(100% - 5px); */
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  #media-info {
    /* width: 100%; */
  }
  .crud-input {
    display: flex;
    width: 100%;
    flex-direction: column;
    /* width: 100%; */
    /* width: calc(100% - 10px); */
    /* width: 100%; */
    /* max-width: calc(100% - 20px); */
  }
  #tags {
  }
  #new-tags {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-gap: 10px;
    align-items: center;
    width: 100%;
    /* display: flex; */
  }
  #new-tags button {
    border: none;
    border-radius: 2px;
  }
  #new-tags button h3 {
    padding: 0 2px;
  }
  #new-tags >div {
    background-color: red;
    width: 100%;
  }
  .group {
    margin-bottom: 5px;
  }
  .tag {
    border: none;
    outline: none;
    width: 100%;
    text-align: left;
    border-radius: 5px;
    box-shadow: 0 1px 1px 1px rgba(0,0,0,0.2);
    display: flex;
    margin-bottom: 2px;
    justify-content: space-between;
  }
</style>
