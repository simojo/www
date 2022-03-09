#!/usr/bin/env sh

directory="wwwApi"

cp backend/*.py /$directory/
rm /$directory/data/posts/*
cp backend/data/posts/* /$directory/data/posts/
cd /$directory
echo $(pwd)
# gunicorn -w 4 main:app (this does not work)
python3 main.py
