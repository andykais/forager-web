<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  onMount(async () => {
    const result = await client.media.list()
    console.log({ result })
  })
</script>

<h1 class="bg-gray-500">Welcome to SvelteKit</h1>
