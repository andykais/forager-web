<script lang="ts">
  import { onMount } from 'svelte'
  import { create_rpc_client } from 'ts-rpc/client'
  import { request_rpc } from 'ts-rpc/client'
  /* import fetch from 'cross-fetch' */
  import type { ForagerSpec } from '../spec'

  // note in the browser the connection string could be as simple as '/rpc'

  /* class Fetcher { */
  /*   constructor(fetch_impl) { */
  /*     this.fetch_impl = fetch_impl */
  /*   } */
  /* } */
  const client = create_rpc_client<ForagerSpec>(`/api/rpc`, { fetch })
  onMount(() => {

    /* console.log({ result }) */

  })

  async function click() {
    /* const response = await fetch('/api/rpc', { method: 'PUT' }) */
    /* console.log(response) */
    /* const result = client.media.search({ tags: [], limit: 100, offset: 0 }) */
    request_rpc('/api/rpc', fetch, [], ['media'], 'search', {  })

  }

  let x = 'hey'

</script>

<h1>Welcome to SvelteKit</h1>
{x}
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={click}>client</button>
