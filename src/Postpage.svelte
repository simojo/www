<script>
  export let params = {
    postId: undefined,
  };
  import marked from "./marked.js";
  export let postobj = undefined;
  import katex from "katex";
  // custom marked blurb (https://gist.github.com/tajpure/47c65cf72c44cb16f3a5df0ebc045f2f)
  const renderer = new marked.Renderer();
  let originParagraph = renderer.paragraph.bind(renderer);
  renderer.paragraph = (text) => {
    const blockRegex = /\$\$[^\$]*\$\$/gm;
    const inlineRegex = /\$[^\$]*\$/g;
    let blockExprArray = text.match(blockRegex);
    console.log(blockExprArray);
    let inlineExprArray = text.match(inlineRegex);
    for (let i in blockExprArray) {
      const expr = blockExprArray[i];
      expr = expr.replace("<br>", "\n").replace("&amp;", "&");
      const result = renderMathsExpression(expr);
      text = text.replace(expr, result);
    }
    for (let i in inlineExprArray) {
      const expr = inlineExprArray[i];
      expr = expr.replace("<br>", "\n").replace("&amp;", "&");
      const result = renderMathsExpression(expr);
      text = text.replace(expr, result);
    }
    return originParagraph(text);
  }
  function renderMathsExpression (expr) {
    console.log(expr);
    if (expr[0] === '$' && expr[expr.length - 1] === '$') {
      let displayStyle = false;
      expr = expr.substr(1, expr.length - 2);
      if (expr[0] === '$' && expr[expr.length - 1] === '$') {
        displayStyle = true;
        expr = expr.substr(1, expr.length - 2);
      }
      let html = null;
      try {
        html = katex.renderToString(expr);
      } catch (e) {
        console.error(e);
      }
      if (displayStyle && html) {
        html = html.replace(/class="katex"/g, 'class="katex katex-block" style="display: block;"');
      }
      return html;
    } else {
      return null;
    }
  }
  marked.setOptions({renderer: renderer});
  /*
  const options = {
    displayMode: true,
    throwOnError: false
  };
  let katexString = (str) => katex.renderToString(str, options);
  */
  function createHtmlBody(text) {
      console.log(text);
      return [text]
        .map(x => marked.parse(x, {gfm: true,  hightlight: true}));
        /*
        .map(x => {
          let temp = x;
          let match = x.match(/(\${2}.+?\${2}|\$.+?\$)/gm);
          console.log(match);
          if (match != null) {
            match.forEach(y => temp = temp.replace(y, katexString(y.replaceAll("$", "").replaceAll("<br>", "\n").replaceAll("&amp;", "&"))))
          }
          return temp;
        });
        */
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
