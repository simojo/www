<script>
	import Router from 'svelte-spa-router';
  import NotFound from "./NotFound.svelte";
  let postNames = [];
  async function loadData() {
    await fetch("https://github.com/simojo/www/blob/dev-svelte/posts")
      .then(x => x.text())
      .then(x => x.match(/[A-Za-z\-]+\.md/g))
      .then(x => x.map(y => `http://raw.githubusercontent.com/simojo/www/blob/dev-svelte/posts/${y}`))
      .catch(error => {
        console.error(error);
      });
  };
  let routes = {
    "*": NotFound,
  };
</script>

<main>
  <Router {routes} />
</main>

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
