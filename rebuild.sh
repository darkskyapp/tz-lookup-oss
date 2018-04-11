#!/bin/bash
set -e
TZ="2018d"

# get data
curl -L --retry 3 -C - \
  -O "https://github.com/evansiroky/timezone-boundary-builder/releases/download/$TZ/timezones.geojson.zip" \
  -O "http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_urban_areas.zip" \
  -O "http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_populated_places_simple.zip"

# unpack tz_world_mp into a useable format. (we do this into a few tiles
# because otherwise they're too big for Node to manage :( )
unzip timezones.geojson.zip
node add_indices
gdal_rasterize -a z -te -180 0 -90 90 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_a.tiff
gdal_rasterize -a z -te -90 0 0 90 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_b.tiff
gdal_rasterize -a z -te 0 0 90 90 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_c.tiff
gdal_rasterize -a z -te 90 0 180 90 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_d.tiff
gdal_rasterize -a z -te -180 -90 -90 0 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_e.tiff
gdal_rasterize -a z -te -90 -90 0 0 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_f.tiff
gdal_rasterize -a z -te 0 -90 90 0 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_g.tiff
gdal_rasterize -a z -te 90 -90 180 0 -ts 12288 12288 -ot UInt16 tz_indexed.json tz_h.tiff
convert tz_a.tiff tz_a.pgm
convert tz_b.tiff tz_b.pgm
convert tz_c.tiff tz_c.pgm
convert tz_d.tiff tz_d.pgm
convert tz_e.tiff tz_e.pgm
convert tz_f.tiff tz_f.pgm
convert tz_g.tiff tz_g.pgm
convert tz_h.tiff tz_h.pgm
rm -rf dist timezones.geojson.zip tz_a.tiff tz_b.tiff tz_c.tiff tz_d.tiff tz_e.tiff tz_f.tiff tz_g.tiff tz_h.tiff tz_indexed.json

# unpack ne_10m_urban_areas into a useable format. (we do this into a single
# file because even at large sizes bitmaps are pretty manageable.)
unzip ne_10m_urban_areas.zip
gdal_rasterize -burn 255 -te -180 -90 180 90 -ts 49152 24576 -ot Byte ne_10m_urban_areas.shp ne_10m_urban_areas.tiff
convert ne_10m_urban_areas.tiff ne_10m_urban_areas.pbm
rm -rf ne_10m_urban_areas.README.html ne_10m_urban_areas.VERSION.txt ne_10m_urban_areas.cpg ne_10m_urban_areas.dbf ne_10m_urban_areas.shp ne_10m_urban_areas.shx ne_10m_urban_areas.prj ne_10m_urban_areas.tiff ne_10m_urban_areas.zip

# and, for good measure, populated places
unzip ne_10m_populated_places_simple.zip
ogr2ogr -f GeoJSON ne_10m_populated_places_simple.json ne_10m_populated_places_simple.shp
rm -rf ne_10m_populated_places_simple.README.html ne_10m_populated_places_simple.VERSION.txt ne_10m_populated_places_simple.cpg ne_10m_populated_places_simple.dbf ne_10m_populated_places_simple.prj ne_10m_populated_places_simple.shp ne_10m_populated_places_simple.shx ne_10m_populated_places_simple.zip

# repack tz_world_mp and ne_10m_urban_areas into a compressed image
node pack | ./node_modules/.bin/uglifyjs -mc >tz.js
rm -rf ne_10m_populated_places_simple.json ne_10m_urban_areas.pbm tz.json tz_a.pgm tz_b.pgm tz_c.pgm tz_d.pgm tz_e.pgm tz_f.pgm tz_g.pgm tz_h.pgm
