const toggleSwitch = document.querySelector(".theme-switch input[type='checkbox']");
const darkFaviconPath = "images/icon-dark/";
const themes = ["dark", "cherry-blossom", "aqua", "cafe"]
var currentTheme = "null"

function attributeExists(attribute) {
  if (typeof(attribute) === "undefined" || attribute == null) {
    return false;
  } else {
    return true;
  }
}

function switchTheme(e) {
  currentThemeIndex = themes.indexOf(currentTheme)
  var nextThemeIndex = (currentThemeIndex + 1 === themes.length ? 0 : currentThemeIndex + 1)
  var theme = themes[nextThemeIndex]
  setTheme(theme)
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  console.log(`data-theme changed from ${currentTheme} to ${theme}.`)
  currentTheme = theme
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
setTheme("dark")
toggleSwitch.addEventListener("change", switchTheme, false);
