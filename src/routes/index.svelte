<script lang="ts">
  import { onMount } from 'svelte'
  import { create_rpc_client } from 'ts-rpc/client'
  /* import fetch from 'cross-fetch' */
  import type { ForagerSpec } from '../spec'

  let tags = []
  let media_references = []
  const client = create_rpc_client<ForagerSpec>(`/api/rpc`)
  onMount(async () => {

    tags = await client.tag.list()
    const result = await client.media.search({ tags: [{ name: 'drawing', group: 'original' }], limit: 100, offset: 0 })
    media_references = [result.result[0]]
  })

</script>

<h1>Welcome to SvelteKit</h1>
<h4>Tags:</h4>
<div>
  {#each tags as tag}
    {tag.group}:{tag.name}
  {/each}
</div>

<div>
  {#each media_references as media_reference}
    <div>
      <img src='/api/thumbnail/{media_reference.id}' alt='/api/thumbnail/{media_reference.id}'>
    </div>
  {/each}
</div>
