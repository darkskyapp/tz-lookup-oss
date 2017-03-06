curl -O http://efele.net/maps/tz/world/tz_world_mp.zip &&\
  unzip tz_world_mp.zip &&\
  rm -rf tz_world_mp.zip &&\
  ogr2ogr -f GeoJSON tz_world_mp.json world/tz_world_mp.shp &&\
  rm -rf world &&\
  node add_indices &&\
  rm tz_world_mp.json &&\
  gdal_rasterize -a Z -te -180 -90 180 90 -ts 24576 12288 -ot UInt16 \
    tz_world_mp_indexed.json tz_world.tiff &&\
  rm tz_world_mp_indexed.json &&\
  convert tz_world.tiff tz_world.pgm &&\
  rm tz_world.tiff &&\
  node pack &&\
  rm tz_world.pgm
