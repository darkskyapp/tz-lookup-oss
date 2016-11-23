"use strict";
var fs            = require("fs"),
    path          = require("path"),
    DATA          = fs.readFileSync(path.join(__dirname, "tz.bin")),
    TIMEZONE_LIST = require("./tz.json"),
    COARSE_WIDTH  = 48,
    COARSE_HEIGHT = 24,
    FINE_WIDTH    = 2,
    FINE_HEIGHT   = 2,
    MAX_TILES     = 65536 - TIMEZONE_LIST.length;

function tzlookup(lat, lon) {
  var x, u, y, v, t, i;

  /* Make sure lat/lon are valid numbers. (It is unusual to check for the
   * negation of whether the values are in range, but this form works for NaNs,
   * too!) */
  lat = +lat;
  lon = +lon;
  if(!(lat >= -90.0 && lat <= +90.0 && lon >= -180.0 && lon <= +180.0)) {
    throw new RangeError("invalid coordinates");
  }

  /* The root node of the tree is wider than a normal node, acting essentially
   * as a "flattened" few layers of the tree. This saves a bit of overhead,
   * since the topmost nodes will probably all be full. */
  x = (180.0 + lon) * COARSE_WIDTH  / 360.00000000000006;
  y = ( 90.0 - lat) * COARSE_HEIGHT / 180.00000000000003;
  u = x|0;
  v = y|0;
  t = -1;
  i = DATA.readUInt16BE((v * COARSE_WIDTH + u) << 1);

  /* Recurse until we hit a leaf node. */
  while(i < MAX_TILES) {
    x = ((x - u) % 1.0) * FINE_WIDTH;
    y = ((y - v) % 1.0) * FINE_HEIGHT;
    u = x|0;
    v = y|0;
    t = t + i + 1;
    i = DATA.readUInt16BE((COARSE_WIDTH * COARSE_HEIGHT + (t * FINE_HEIGHT + v) * FINE_WIDTH + u) << 1);
  }

  /* Once we hit a leaf, return the relevant timezone. */
  return TIMEZONE_LIST[i - MAX_TILES];
}

module.exports = tzlookup;
