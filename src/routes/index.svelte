<script lang="ts">
  import { onMount } from 'svelte'
  import { client } from '../client'
  import Toolbar from '../components/search/toolbar.svelte'
  import MediaReference from '../components/media_reference.svelte'
  import MediaList from '../components/media_list.svelte'
  import MediaListFooter from '../components/media_list_footer.svelte'

  let current_media_index = 0
  const selected_media_ids = []
  let show_media_reference_ui = true

  onMount(async () => {
    const result = await client.media.list()
    console.log({ result })
  })
  function on_toggle_media_reference_iu(e) {
    show_media_reference_ui = !show_media_reference_ui
  }
</script>

<div class="flex flex-col h-screen">
  <Toolbar />
  <div class="flex flex-1">
      <div class="grid  w-full" class:grid-cols-media-reference-list={show_media_reference_ui} class:grid-cols-media-list-only={!show_media_reference_ui}>
        {#if show_media_reference_ui}
          <div class="bg-gray-600"><MediaReference /></div>
        {/if}
        <button
          class="bg-gray-600 border-r border-r-2 border-x-slate-800 h-full flex items-center px-[2px] py-10 hover:bg-slate-500
        text-3xl text-lime-600"
          on:click={on_toggle_media_reference_iu}>
          {show_media_reference_ui ? '🢒' : '🢐'}
        </button>
        <div class=""><MediaList /></div>
    </div>
  </div>
  <MediaListFooter />
</div>
