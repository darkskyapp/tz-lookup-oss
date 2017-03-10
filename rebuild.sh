#!/bin/bash
set -e

# get data
curl -L -O http://efele.net/maps/tz/world/tz_world_mp.zip -O http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_urban_areas.zip

# unpack tz_world_mp into a useable format
unzip tz_world_mp.zip
ogr2ogr -f GeoJSON tz_world_mp.json world/tz_world_mp.shp
node add_indices
gdal_rasterize -a Z -te -180 -90 180 90 -ts 24576 12288 -ot UInt16 tz_world_mp_indexed.json tz_world.tiff
convert tz_world.tiff tz_world.pgm
rm -rf tz_world.tiff tz_world_mp.json tz_world_mp.zip tz_world_mp_indexed.json world

# unpack ne_10m_urban_areas into a useable format
unzip ne_10m_urban_areas.zip
gdal_rasterize -burn 255 -te -180 -90 180 90 -ts 24576 12288 -ot Byte ne_10m_urban_areas.shp ne_10m_urban_areas.tiff
convert ne_10m_urban_areas.tiff ne_10m_urban_areas.pgm
rm -rf ne_10m_urban_areas.README.html ne_10m_urban_areas.VERSION.txt ne_10m_urban_areas.dbf ne_10m_urban_areas.shp ne_10m_urban_areas.shx ne_10m_urban_areas.prj ne_10m_urban_areas.tiff ne_10m_urban_areas.zip

# repack tz_world_mp and ne_10m_urban_areas into a compressed image
node pack
rm -rf tz_world.pgm ne_10m_urban_areas.pgm
