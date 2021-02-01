const toggleSwitch = document.querySelector(".theme-switch input[type='checkbox']");
const lightFaviconPath = "images/icon-light/";
const darkFaviconPath = "images/icon-dark/";
const themes = ["dark", "light"]
// TODO: choose random color scheme upon switching

function attributeExists(attribute) {
  if (typeof(attribute) === "undefined" || attribute == null) {
    return false;
  } else {
    return true;
  }
}

function switchTheme(e) {
  var theme = ""
  if (e.target.checked) {
    theme = "light"
  } else {
    theme = "aqua"
  }
  setTheme(theme)
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  switchFavicon(theme)
}

function switchFavicon(theme) {
  switch (theme) {
    case "light":
      setFaviconLinks(lightFaviconPath);
      break;
    case "dark":
      setFaviconLinks(darkFaviconPath);
      break;
  }
}

function setFaviconLinks(baseUrl) {
  let favicons = [
    { rel: "apple-touch-icon", href: "apple-touch-icon.png" },
    { rel: "icon", href: "favicon-32x32.png" },
    { rel: "icon", href: "favicon-16x16.png" },
    { rel: "manifest", href: "site.webmanifest"}
  ];
  favicons.forEach(function(favicon) {
    var link = document.querySelector("link[rel~='${favicon.rel}']");
    if (!link) {
      link = document.createElement("link");
      link.rel = favicon.rel;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.setAttribute("href", `${baseUrl}${favicon.href}`);
  });
}

// init
setFaviconLinks(darkFaviconPath);
toggleSwitch.addEventListener("change", switchTheme, false);
