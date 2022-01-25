<script context="module" lang="ts">
  export const load = ({ session }) => {
    return {
        props: {
            config: session.config
          }
      }
  }
</script>

<script lang="ts">
  import Toolbar from '../components/search/toolbar.svelte'
  import MediaReference from '../components/media_reference.svelte'
  import MediaList from '../components/media_list.svelte'
  import MediaListFooter from '../components/media_list_footer.svelte'
  import Sidebar from  '../components/sidebar.svelte'
  import type { Config } from '../config'

  export let config: Config
  let screen_height = 0
  let toolbar_height = 0
  let footer_height = 40
  let media_list_height = 0

  $: media_list_height = screen_height - toolbar_height - footer_height

  let thumbnail_size = config.default_thumbnail_size

</script>

<div class="flex flex-col h-screen">
  <Toolbar {config} bind:height={toolbar_height} />
  <div class="flex flex-1">
    <Sidebar classes="bg-gray-600" default_width={200}><MediaReference /></Sidebar>
    <div class="w-full overflow-y-scroll focus:outline-none" style="height: {media_list_height}px" tabindex=-1>
      <MediaList {thumbnail_size} />
    </div>
  </div>
  <MediaListFooter bind:thumbnail_size={thumbnail_size} bind:height={footer_height} />
</div>

<svelte:window bind:innerHeight={screen_height}></svelte:window>
