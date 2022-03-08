#!/usr/bin/env sh

directory="wwwDev"
echo $1

if  command -v elm > /dev/null; then
  elm make frontend/src/Main.elm --output=frontend/src/elm.js
else
  echo "WARNING: Elm is not installed. Please install elm if you wish to recompile to javascript."
fi
if [ -d "/$directory/" ]; then
  cp frontend/index.html "/$directory/"
  cp -r frontend/assets "/$directory/"
  cp frontend/elm.js "/$directory/"
else
  echo "ERROR: Cannot find directory: /$directory/. Please ensure you know what you're doing."
fi
