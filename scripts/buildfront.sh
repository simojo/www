#!/usr/bin/env sh

echo $1

if  command -v elm > /dev/null; then
  elm make src/Main.elm --output=elm.js
else
  echo "WARNING: Elm is not installed. Please install elm if you wish to recompile to javascript."
fi
