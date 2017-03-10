#!/bin/bash
set -e

# get data
curl -L -O http://efele.net/maps/tz/world/tz_world_mp.zip -O http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_urban_areas.zip

# unpack tz_world_mp into a useable format. (we do this into a few tiles
# because otherwise they're too big for Node to manage :( )
unzip tz_world_mp.zip
ogr2ogr -f GeoJSON tz_world_mp.json world/tz_world_mp.shp
node add_indices
gdal_rasterize -a Z -te -180 0 -90 90 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_a.tiff
gdal_rasterize -a Z -te -90 0 0 90 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_b.tiff
gdal_rasterize -a Z -te 0 0 90 90 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_c.tiff
gdal_rasterize -a Z -te 90 0 180 90 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_d.tiff
gdal_rasterize -a Z -te -180 -90 -90 0 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_e.tiff
gdal_rasterize -a Z -te -90 -90 0 0 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_f.tiff
gdal_rasterize -a Z -te 0 -90 90 0 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_g.tiff
gdal_rasterize -a Z -te 90 -90 180 0 -ts 12288 12288 -ot UInt16 tz_world_mp_indexed.json tz_world_h.tiff
convert tz_world_a.tiff tz_world_a.pgm
convert tz_world_b.tiff tz_world_b.pgm
convert tz_world_c.tiff tz_world_c.pgm
convert tz_world_d.tiff tz_world_d.pgm
convert tz_world_e.tiff tz_world_e.pgm
convert tz_world_f.tiff tz_world_f.pgm
convert tz_world_g.tiff tz_world_g.pgm
convert tz_world_h.tiff tz_world_h.pgm
rm -rf tz_world_a.tiff tz_world_b.tiff tz_world_c.tiff tz_world_d.tiff tz_world_e.tiff tz_world_f.tiff tz_world_g.tiff tz_world_h.tiff tz_world_mp.json tz_world_mp_indexed.json world

# unpack ne_10m_urban_areas into a useable format. (we do this into a single
# file because even at large sizes bitmaps are pretty manageable.)
unzip ne_10m_urban_areas.zip
gdal_rasterize -burn 255 -te -180 -90 180 90 -ts 49152 24576 -ot Byte ne_10m_urban_areas.shp ne_10m_urban_areas.tiff
convert ne_10m_urban_areas.tiff ne_10m_urban_areas.pbm
rm -rf ne_10m_urban_areas.README.html ne_10m_urban_areas.VERSION.txt ne_10m_urban_areas.dbf ne_10m_urban_areas.shp ne_10m_urban_areas.shx ne_10m_urban_areas.prj ne_10m_urban_areas.tiff

# repack tz_world_mp and ne_10m_urban_areas into a compressed image
#node pack
#rm -rf tz_world.pgm ne_10m_urban_areas.pbm
