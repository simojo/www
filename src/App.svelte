<script>
	import Router from 'svelte-spa-router';
  import {push} from 'svelte-spa-router';
  import {wrap} from "svelte-spa-router/wrap";
  import Home from './Home.svelte';
  import Postpage from './Postpage.svelte';
  import Faith from './Faith.svelte';
  import LinkedInIcon from './LinkedInIcon.svelte';
  import GithubIcon from './GithubIcon.svelte';
  let routes = {
    "/posts/:postId": Postpage,
    "/faith/": Faith,
    "/": Home,
    "*": Home,
  };
</script>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
<div id="navbar">
  <a class="nav" on:click={() => { push("/"); }}>Simon Jones</a>
  <a class="nav" on:click={() => { push("/posts/") }}>Posts</a>
  <a class="nav" on:click={() => { push("/faith/") }}>{@html "&#10014;"} Faith</a>
  <a class="nav" href="https://github.com/simojo" target="_blank">
    <GithubIcon />
  </a>
  <a class="nav" href="https://linkedin.com/in/simojo" target="_blank">
    <LinkedInIcon />
  </a>
</div>
<div class="container">
<Router {routes} />
</div>
