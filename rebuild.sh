#!/bin/sh
curl -O http://efele.net/maps/tz/world/tz_world.zip
unzip tz_world.zip
ogr2ogr -f GeoJSON tz_world.json world/tz_world.shp
./json2bin
