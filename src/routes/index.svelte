<script lang="ts">
  import { onMount } from 'svelte'
  import { create_rpc_client } from 'ts-rpc/client'
  /* import fetch from 'cross-fetch' */
  import type { ForagerSpec } from '../spec'

  // note in the browser the connection string could be as simple as '/rpc'

  /* class Fetcher { */
  /*   constructor(fetch_impl) { */
  /*     this.fetch_impl = fetch_impl */
  /*   } */
  /* } */
  const client = create_rpc_client<ForagerSpec>(`/api/rpc`)
  onMount(async () => {

    /* console.log({ result }) */

    /* click() */
    const response = await client.media.search({ tags: [], limit: 100, offset: 0 })
    console.log({ response })
  })

  async function click() {
    /* const response = await fetch('/api/rpc', { method: 'PUT' }) */
    /* console.log(response) */
    /* const response = await client.media.search({ tags: [], limit: 100, offset: 0 }) */
    /* const response = await request_rpc('/api/rpc', fetch, [], ['media'], 'search', [{}]) */
    /* console.log({ response }) */

  }

  let x = 'hey'

</script>

<h1>Welcome to SvelteKit</h1>
{x}
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={click}>client</button>
