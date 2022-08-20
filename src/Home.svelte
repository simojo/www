<script>
  import Postcard from "./Postcard.svelte";
  let postUrls = [];
  let postTexts = [];
  let postObjs = [];
  async function parseIntoPostObj(s) {
    let text = "";
    await fetch(s.download_url)
      .then(x => text = x.text())
      .catch(x => console.error(x));
    let ret = {
      postid: s.name.match(/.*(?=\.md)/),
      title: text.split("\n")[0].match(/(?<=# ).*/g)[0],
      subtitle: text.split("\n")[1].match(/(?<=## ).*/g)[0],
      date: text.split("\n")[2].match(/(?<=### ).*/g)[0],
    };
    console.log(ret);
    postObjs = [...postObjs, ret];
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
  $: console.log(postObjs);
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
  <Postcard
    postid={postObj.postid}
    title={postObj.title}
    subtitle={postObj.subtitle}
    date={postObj.date} />
{/each}
</div>
