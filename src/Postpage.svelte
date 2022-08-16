<script>
  export let params = {
    postId: undefined,
  };
</script>
{#if params.postId !== undefined}
  <h1>{params.postId}</h1>
{/if}
