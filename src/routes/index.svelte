<script lang="ts">
  import { onMount } from 'svelte'
  import { create_rpc_client } from 'ts-rpc/client'
  /* import fetch from 'cross-fetch' */
  import type { ForagerSpec } from '../spec'

  let tags = []
  let media_references = []
  let total_media_references = 0
  const client = create_rpc_client<ForagerSpec>(`/api/rpc`)
  onMount(async () => {

    tags = await client.tag.list()
    /* const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 }) */
    const result = await client.media.list()
    total_media_references = result.total
    media_references = result.result
    console.log({ media_references })
  })

</script>

<h4>Tags:</h4>
<div id="tags">
  {#each tags as tag}
    <div class="tag" style="background-color: #{tag.color}">{tag.group}:{tag.name}</div>
  {/each}
</div>

<h4>Media ({total_media_references} total)</h4>
<div id="thumbnail-grid">
  {#each media_references as media_reference}
    <div class="thumbnail" tabindex="0">
      <img src="/api/thumbnail/{media_reference.id}" alt="/api/thumbnail/{media_reference.id}">
    </div>
      <!--
      <img class="thumbnail" src='/api/thumbnail/{media_reference.id}' alt='/api/thumbnail/{media_reference.id}'>
      -->
  {/each}
</div>

<style>
  #tags {
    font-family: monospace;
    height: 200px;
    overflow-y: scroll;
    padding: 5px 0;
  }

  .tag {
    padding: 0 5px;
    margin: 2px;
    border-radius: 2px;
  }

  #thumbnail-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .thumbnail {
    box-shadow: 1px 1px 8px 1px rgba(0,0,0,0.4);
    border-radius: 5px;
    margin: 10px;
    padding: 5px;
    display: inline;
    height: 200px;
    width: 200px;
    display: flex;
    justify-content: center;
  }

  .thumbnail > img {
    height: 100%;
  }
</style>
