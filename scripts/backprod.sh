#!/usr/bin/env sh

cp backend/*.py /wwwApi/
cd /wwwApi
gunicorn -w 4 main:app
