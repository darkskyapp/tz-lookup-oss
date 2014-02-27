var fs        = require("fs"),
    inflate   = require("zlib").inflateRaw,
    DATA_FILE = require("path").join(__dirname, "tz.new.bin");

module.exports = function(lat, lon, callback) {
  lat = +lat;
  lon = +lon;

  if(!(lat >= -90.0 && lat <= +90.0 && lon >= -180.0 && lon <= +180.0)) {
    callback(new RangeError("invalid coordinates"), null);
    return;
  }

  fs.open(DATA_FILE, "r", function(err, fd) {
    var buffer;

    if(err) {
      callback(err, null);
      return;
    }

    buffer = new Buffer(1024);

    fs.read(fd, buffer, 0, 10, 0, function(err, n) {
      var tiles_across, tiles_down, tile_width, tile_height, chunk_count,
          tz_count, width, height, map_off, map_len, chunklist_off,
          chunklist_len, tzlist_off, tzlist_len, data_off, x, y, cell_off;

      function finish(err, data) {
        fs.close(fd, function(_) {
          callback(err, data);
        });
      }

      if(err) {
        finish(err, null);
        return;
      }

      if(n !== 10) {
        finish(new Error("unable to read header"), null);
        return;
      }

      tiles_across  = buffer.readUInt16LE(0);
      tiles_down    = buffer.readUInt16LE(2);
      tile_width    = buffer.readUInt8(4);
      tile_height   = buffer.readUInt8(5);
      chunk_count   = buffer.readUInt16LE(6);
      tz_count      = buffer.readUInt16LE(8);
      width         = tiles_across * tile_width;
      height        = tiles_down * tile_height;
      map_off       = 10;
      map_len       = (tiles_across * tiles_down) << 1;
      chunklist_off = map_off + map_len;
      chunklist_len = chunk_count << 2;
      tzlist_off    = chunklist_off + chunklist_len;
      tzlist_len    = tz_count << 2;
      data_off      = tzlist_off + tzlist_len;

      x = Math.round((180.0 + lon) * width / 360.0) % width;
      y = Math.round((90.0 - lat) * (height - 1) / 180.0);
      cell_off = map_off + ((Math.floor(y / tile_height) * tiles_across + Math.floor(x / tile_width)) << 1);

      fs.read(fd, buffer, 0, 2, cell_off, function(err, n) {
        var num, chunk_off;

        function timezone(i) {
          var tz_off = tzlist_off + (i << 2);

          fs.read(fd, buffer, 0, 4, tz_off, function(err, n) {
            var num, tzdata_len, tzdata_off;

            if(err) {
              finish(err, null);
              return;
            }

            if(n !== 4) {
              finish(new Error("unable to read timezone list"), null);
              return;
            }

            num        = buffer.readUInt32LE(0);
            tzdata_len = num & 0x000003FF;
            tzdata_off = data_off + (num >>> 10);

            /* This should never happen. */
            if(tzdata_len > buffer.length) {
              finish(new Error("unable to read long timezone"), null);
              return;
            }

            fs.read(fd, buffer, 0, tzdata_len, tzdata_off, function(err, n) {
              if(err) {
                finish(err, null);
                return;
              }

              if(n !== tzdata_len) {
                finish(new Error("unable to read timezone"), null);
                return;
              }

              finish(null, buffer.toString("ascii", 0, tzdata_len));
            });
          });
        }

        if(err) {
          finish(err, null);
          return;
        }

        if(n !== 2) {
          finish(new Error("unable to read timezone map"), null);
          return;
        }

        num = buffer.readUInt16LE(0);

        if((num & 0xFE00) === 0xFE00) {
          timezone(num & 0x01FF);
          return;
        }

        chunk_off = chunklist_off + (num << 2);

        fs.read(fd, buffer, 0, 4, chunk_off, function(err, n) {
          var num, chunkdata_len, chunkdata_off;

          if(err) {
            finish(err, null);
            return;
          }

          if(n !== 4) {
            finish(new Error("unable to read chunk list"), null);
            return;
          }

          num           = buffer.readUInt32LE(0);
          chunkdata_len = num & 0x000003FF;
          chunkdata_off = data_off + (num >>> 10);

          /* This should never happen. */
          if(chunkdata_len > buffer.length) {
            finish(new Error("unable to read long chunk"), null);
            return;
          }

          fs.read(fd, buffer, 0, chunkdata_len, chunkdata_off, function(err, n) {
            var palette_len, bitmap_off, bpp;

            if(err) {
              finish(err, null);
              return;
            }

            if(n !== chunkdata_len) {
              finish(new Error("unable to read chunk"), null);
              return;
            }

            palette_len = buffer.readUInt8(0);
            bitmap_off  = 1 + (palette_len << 1);

            if(palette_len > 16)
              bpp = 8;

            else if(palette_len > 4)
              bpp = 4;

            else if(palette_len > 2)
              bpp = 2;

            else if(palette_len > 1)
              bpp = 1;

            /* This should never happen. */
            else {
              finish(new Error("invalid chunk palette size"), null);
              return;
            }

            inflate(buffer.slice(bitmap_off), function(err, bitmap) {
              var bit, index, palette_off;

              if(err) {
                finish(err, null);
                return;
              }

              bit = ((y % tile_height) * tile_width + (x % tile_width)) * bpp;
              index = (bitmap.readUInt8(bit >> 3) >> (bit & 7)) & ((1 << bpp) - 1);
              palette_off = 1 + (index << 1);
              timezone(buffer.readUInt16LE(palette_off));
            });
          });
        });
      });
    });
  });
};
