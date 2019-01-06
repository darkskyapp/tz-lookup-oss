#!/bin/bash
set -ex
TZ="2018i"

rm -rf timezones.geojson.zip dist
curl -L --retry 3 -C - \
  -O "https://github.com/evansiroky/timezone-boundary-builder/releases/download/$TZ/timezones.geojson.zip"
unzip timezones.geojson.zip
node pack.js | ./node_modules/.bin/uglifyjs -mc >tz.js
