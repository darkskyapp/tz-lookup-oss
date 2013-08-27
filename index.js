var distance = require("./lib/geometry").distanceSquared.point.polygon,
    fs       = require("fs"),
    path     = require("path"),
    zlib     = require("zlib"),
    WIDTH    = 96,
    HEIGHT   = 48,
    buckets  = require("cache-helpers").once(function(callback) {
      return readGzippedJSON(
        path.join(__dirname, "data/metadata.json.gz"),
        callback
      );
    });

function readGzippedJSON(path, callback) {
  return fs.readFile(path, function(err, data) {
    if(err)
      return callback(err, null);

    return zlib.gunzip(data, function(err, data) {
      if(err)
        return callback(err, null);

      try {
        data = JSON.parse(data.toString("ascii"));
      }

      catch(err) {
        return callback(err, null);
      }

      return callback(null, data);
    });
  });
}

function lookup(lat, lon, callback) {
  return buckets(function(err, data) {
    if(err)
      return callback(err, null);

    var x = Math.floor((lon + 180) * WIDTH / 360),
        y = Math.floor((90 - lat) * HEIGHT / 180),
        i = y * WIDTH + x;

    if(data[i] !== "DISC")
      return callback(null, data[i]);

    return readGzippedJSON(
      path.join(__dirname, "data", i + ".json.gz"),
      function(err, data) {
        if(err)
          return callback(err, null);

        if(typeof data === "string")
          return callback(null, data);

        /* NASTY HACK: We require that the response is the closest polygon
         * within 0.25 degrees. There's a bunch of problems with this. First,
         * it disregards nearby polygons in different buckets. Second, we treat
         * the Earth's surface as a plane, which isn't accurate. This should be
         * *good enough* for our purposes, though, and I don't have the time to
         * make this beautiful and perfect. (In fact, doing so is nearly
         * impossible since territorial waters aren't well-defined by
         * international law. Oh well.) */

        var point = [lon, lat],
            tz    = null,
            best  = 0.125,
            i, dist;

        for(i = data.length; i; ) {
          i -= 2;
          dist = distance(point, data[i + 1]);

          if(dist < best) {
            best = dist;
            tz = data[i];
          }
        }

        return callback(null, tz);
      }
    );
  });
}

function fallback(lat, lon) {
  switch(Math.round((lon + 180) / 15)) {
    case  0: return "Etc/GMT+12";
    case  1: return "Etc/GMT+11";
    case  2: return "Etc/GMT+10";
    case  3: return "Etc/GMT+9";
    case  4: return "Etc/GMT+8";
    case  5: return "Etc/GMT+7";
    case  6: return "Etc/GMT+6";
    case  7: return "Etc/GMT+5";
    case  8: return "Etc/GMT+4";
    case  9: return "Etc/GMT+3";
    case 10: return "Etc/GMT+2";
    case 11: return "Etc/GMT+1";
    case 12: return "Etc/GMT";
    case 13: return "Etc/GMT-1";
    case 14: return "Etc/GMT-2";
    case 15: return "Etc/GMT-3";
    case 16: return "Etc/GMT-4";
    case 17: return "Etc/GMT-5";
    case 18: return "Etc/GMT-6";
    case 19: return "Etc/GMT-7";
    case 20: return "Etc/GMT-8";
    case 21: return "Etc/GMT-9";
    case 22: return "Etc/GMT-10";
    case 23: return "Etc/GMT-11";
    case 24: return "Etc/GMT-12";
  }
}

module.exports = function(lat, lon, callback) {
  if(lat < -90 || lat > 90 || lon < -180 || lon > 180)
    return callback(new RangeError("Invalid coordinates provided."));

  return lookup(lat, lon, function(err, tzid) {
    return callback(err, !err ? tzid || fallback(lat, lon) : null);
  });
}
