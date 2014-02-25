var fs        = require("fs"),
    join      = require("path").join,
    inflate   = require("zlib").inflate,
    DATA_FILE = join(__dirname, "tz.bin");

module.exports = function(lat, lon, callback) {
  lat = +lat;
  lon = +lon;

  if(!(lat >= -90.0 && lat <= +90.0 && lon >= -180.0 && lon <= +180.0))
    callback(new RangeError("invalid coordinates"), null);

  else {
    fs.open(DATA_FILE, "r", function(err, fd) {
      var buffer;

      if(err)
        callback(err, null);

      else {
        buffer = new Buffer(32);

        fs.read(fd, buffer, 0, 12, 0, function(err, n) {
          var tiles_across, tiles_down, tile_width, tile_height,
              tz_count, tz_width, width, height, index_len, tz_len, x, y,
              index_off;

          function finish(err, data) {
            fs.close(fd, function(_) {
              callback(err, data);
            });
          }

          if(err)
            finish(err, null);

          else if(n !== 12)
            finish(new Error("unable to read header"), null);

          else {
            tiles_across = buffer.readUInt16LE( 0);
            tiles_down   = buffer.readUInt16LE( 2);
            tile_width   = buffer.readUInt16LE( 4);
            tile_height  = buffer.readUInt16LE( 6);
            tz_count     = buffer.readUInt16LE( 8);
            tz_width     = buffer.readUInt16LE(10);

            if(tz_width > buffer.length)
              finish(new Error("unexpected timezone width"), null);

            else {
              width     = tiles_across * tile_width;
              height    = tiles_down * tile_height;
              index_len = (tiles_across * tiles_down) << 2;
              tz_len    = tz_count * tz_width;

              x = Math.round((180.0 + lon) * width / 360.0) % width;
              y = Math.round((90.0 - lat) * (height - 1) / 180.0);
              index_off = (Math.floor(y / tile_height) * tiles_across + Math.floor(x / tile_width)) << 2;

              fs.read(fd, buffer, 0, 4, 12 + index_off, function(err, n) {
                var off, len;

                function timezone(n) {
                  var tz_off = 12 + index_len + n * tz_width;

                  fs.read(fd, buffer, 0, tz_width, tz_off, function(err, n) {
                    if(err)
                      finish(err, null);

                    else if(n !== tz_width)
                      finish(new Error("unable to read timezone"), null);

                    else {
                      for(n = 0; n < tz_width && buffer[n]; n++);
                      finish(null, buffer.toString("ascii", 0, n));
                    }
                  });
                }

                if(err)
                  finish(err, null);

                else if(n !== 4)
                  finish(new Error("unable to read index"), null);

                else {
                  off = buffer.readUInt32LE(0) >>> 12;
                  len = buffer.readUInt32LE(0) & 4095;

                  if(off === 0xFFFFF)
                    timezone(len);

                  else {
                    off = 12 + index_len + tz_len + off;

                    fs.read(fd, new Buffer(len), 0, len, off, function(err, n, data) {
                      if(err)
                        finish(err, null);

                      else if(n !== len)
                        finish(new Error("unable to read tile"), null);

                      else
                        inflate(data, function(err, data) {
                          var tile_off;

                          if(err)
                            finish(err, null);

                          else {
                            tile_off = ((y % tile_height) * tile_width + (x % tile_width)) << 1;
                            timezone(data.readUInt16LE(tile_off));
                          }
                        });
                    });
                  }
                }
              });
            }
          }
        });
      }
    });
  }
};
