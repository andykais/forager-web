<script lang="ts">

  export let height = 0
  export let thumbnail_size: number
</script>

<div class="flex justify-center bg-gray-600 border-t border-t-[2px] border-gray-800" style="height: {height}px">
  <div class="w-3/5 grid grid-cols-auto-1fr-auto gap-4 items-center text-slate-800">
    <label for="thumbnail-size">Thumbnail Size</label>
    <input
      class="appearance-none h-[7px] rounded-full bg-gray-800 slider-handle"
      name="thumbnail-size"
      type="range"
      min={50}
      max={500}
      bind:value={thumbnail_size}>
    <span>{thumbnail_size}px</span>
  </div>
</div>

<style>
  .slider-handle::-webkit-slider-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgb(132 204 22 / var(--tw-text-opacity));
  }
  .slider-handle::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgb(132 204 22 / var(--tw-text-opacity));
  }
</style>
