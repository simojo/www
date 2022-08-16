<script>
  export let postId = undefined;
  export let posts = [];
</script>

{#if postId !== undefined}
  <div class="postcard">
    <h4>{postId}</h4>
  </div>
{/if}
