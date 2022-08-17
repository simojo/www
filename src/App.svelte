<script>
	import Router from 'svelte-spa-router';
  import {wrap} from "svelte-spa-router/wrap";
  import Home from './Home.svelte';
  import Postpage from './Postpage.svelte';
  let routes = {
    "/posts/:postId": Postpage,
    "/": Home,
    "*": Home,
  };
  let drywrap = (component) => wrap({
      asyncComponent: () => import(component)
    });
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
  <a>Simon Jones</a>
  <a>Posts</a>
  <a>Posts</a>
</div>
<div class="container">
<Router {routes} />
</div>
