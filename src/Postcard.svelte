<script>
  import {push} from "svelte-spa-router";
  export let postid = undefined;
  export let title = undefined;
  export let subtitle = undefined;
  export let date = undefined;
</script>

<style>
  a.postcard {
    width: 20rem;
    background-color: var(--bg1);
    padding: 0.5rem 1rem;
    transition: background-color 0.5s;
    box-sizing: border-box;
    border: 1px solid var(--bg1);
  }
  a.postcard:hover {
    border: 1px solid var(--bg2);
  }
</style>

{#if title !== undefined}
  <a class="postcard" on:click={() => {
    push("/posts/" + postid);
  }}>
    <h2>{title}</h2>
    <p>{subtitle}</p>
    <h5>{date}</h5>
  </a>
{/if}
