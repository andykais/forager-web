<script>
  export let tag
</script>


<div class="container">
  <h3>Group</h3>
  <h4>{tag.group}</h4>
  <h3>Name</h3>
  <h4>{tag.name}</h4>
  <h3>Description</h3>
  <input value={tag.description}>
  <h3>Metadata</h3>
  <input value={JSON.stringify(tag.metadata)}>
  <h3>Media Reference Count</h3>
  <h4>{tag.media_reference_count}</h4>
  <h3>Unread Media Reference Count</h3>
  <h4>{tag.unread_media_reference_count}</h4>
</div>

<style>
  .container {
    width: 80%;
    margin: 10% 0;
    padding: 10px;
    border-radius: 5px;
    background: rgb(140, 140, 140);
    box-shadow: 1px 1px 5px black;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
