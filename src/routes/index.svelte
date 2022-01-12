<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import Toolbar from '../components/search/toolbar.svelte'
  import MediaReference from '../components/media_reference.svelte'
  import MediaList from '../components/media_list.svelte'
  import MediaListFooter from '../components/media_list_footer.svelte'
  import Sidebar from  '../components/sidebar.svelte'

  onMount(async () => {
    const result = await client.media.list()
    console.log({ result })
  })
</script>

<div class="flex flex-col h-screen">
  <Toolbar />
  <div class="flex flex-1">
    <Sidebar classes="bg-gray-600" default_width={200}><MediaReference /></Sidebar>
    <div class=""><MediaList /></div>
  </div>
  <MediaListFooter />
</div>
