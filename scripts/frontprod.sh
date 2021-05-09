#!/usr/bin/env sh

echo $1

if  command -v elm > /dev/null; then
  elm make frontend/src/Main.elm --output=frontend/src/elm.js
else
  echo "WARNING: Elm is not installed. Please install elm if you wish to recompile to javascript."
fi
if [ -d "/wwwDev/" ]; then
  cp frontend/index.html /wwwDev/
  cp -r frontend/assets /wwwDev/
  cp frontend/elm.js /wwwDev/
else
  echo "ERROR: Cannot find directory: /wwwDev/. Please ensure you know what you're doing."
fi
