<script>
  import {push} from "svelte-spa-router";
  export let postobj = undefined;
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
  span.date {
    font-family: Roboto Mono;
    font-size: smaller;
    color: var(--fg1);
  }
  h2 {
    margin-top: 0.3rem;
  }
</style>

{#if postobj.title !== undefined}
  <a class="postcard" on:click={() => {
    push(`/posts/${postobj.postid}`);
  }}>
    <span class="date">{postobj.date}</span>
    <h2>{postobj.title}</h2>
    <p>{postobj.subtitle}</p>
  </a>
{/if}
