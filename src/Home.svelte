<script>
  import Postcard from "./Postcard.svelte";
  let postObjs = [];
  async function parseIntoPostObj(s) {
    let text = "";
    await fetch(s.download_url)
      .then(x => x.text())
      .then(x => text = x)
      .catch(x => console.error(x));
    let ret = {
      postid: s.name.match(/.*(?=\.md)/g)[0],
      title: text.split("\n")[0].match(/(?<=# ).*/g)[0],
      subtitle: text.split("\n")[1].match(/(?<=## ).*/g)[0],
      date: text.split("\n")[2].match(/(?<=### ).*/g)[0],
      text: text.split("\n").slice(3),
    };
    postObjs = [...postObjs, ret];
    postObjs = postObjs.sort((a,b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0));
  }
  async function loadData() {
    let user = "simojo";
    let repo = "www";
    let branch = "dev-svelte"
      await fetch(`https://api.github.com/repos/simojo/www/contents/posts?ref=dev-svelte`, { accept: "application/vnd.github.v3.raw+json", })
        .then(x => x.json())
        .then(x => x.forEach(y => parseIntoPostObj(y)))
        .catch(error => console.error(error));
  }
  loadData();
</script>
<style>
  div.post-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  h1 {
  }
</style>

<h1>
</h1>
<div class="post-grid">
{#each postObjs as postObj}
  <Postcard postobj={postObj} />
{/each}
</div>
