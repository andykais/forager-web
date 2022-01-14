<script lang="ts">
  import type { MediaReferenceTR } from 'forager/src/models/media_reference'

  export let media_reference: MediaReferenceTR
</script>


<img class="w-20" src="/api/thumbnail/{media_reference.id}" />
