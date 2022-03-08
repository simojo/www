#!/usr/bin/env sh

directory="wwwDev"
echo $1

if [ -d "/$directory/" ]; then
  cp frontend/index.html "/$directory/"
  cp -r frontend/assets "/$directory/"
  cp frontend/elm.js "/$directory/"
else
  echo "ERROR: Cannot find directory: /$directory/. Please ensure you know what you're doing."
fi
