<script>
  export let params = {
    postId: undefined,
  };
  import {parse} from "./marked.js";
  export let postobj = undefined;
  import katex from "katex";
  const options = {
    displayMode: displayMode,
    	throwOnError: false
  };
  let katexString = (str) => katex.renderToString(str, options);
  function createHtmlBody(text) {
      console.log(text);
      return [text]
        .map(x => parse(x, {gfm: true, breaks: true, hightlight: true}))
        .map(x => {
          let temp = x;
          x.match(/(?<=\${1,2}).*?(?=\${1,2})/g)
            .forEach(y => temp.replace(y, katexString(y)))
          return temp;
        });
  }
  async function loadData() {
    await fetch(`https://raw.githubusercontent.com/simojo/www/dev-svelte/posts/${params.postId}.md`)
      .then(x => x.text())
      .then(x => postobj = {
          postid: params.postId,
          title: x.split("\n")[0].match(/(?<=# ).*/g)[0],
          subtitle: x.split("\n")[1].match(/(?<=## ).*/g)[0],
          date: x.split("\n")[2].match(/(?<=### ).*/g)[0],
          text: createHtmlBody(x.split("\n").slice(3).reduce((i, a) => i + "\n" + a)),
        }
      )
  }
  loadData();
</script>

{#if postobj !== undefined}
  <h1>{postobj.title}</h1>
  {@html postobj.text}
{/if}
