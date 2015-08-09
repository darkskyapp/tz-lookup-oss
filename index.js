var fs = require("fs");
var DATA = fs.readFileSync(
      require("path").join(__dirname, "tz.bin")
    ),
    TIMEZONE_LIST = JSON.parse(fs.readFileSync(
      require("path").join(__dirname, "tzArray.json")
    )),
    COARSE_WIDTH  = 48,
    COARSE_HEIGHT = 24,
    FINE_WIDTH    = 2,
    FINE_HEIGHT   = 2,
    MAX_TILES     = 65536 - TIMEZONE_LIST.length;

function sortByTz(array) {
     array.sort(function(a, b) {
        if ((a.name) && (b.name)) {
            var keyA = Number(a.name.substr(4,6).replace(":", "."));
                keyB = Number(b.name.substr(4,6).replace(":", "."));
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        } else {
            return 0;
        }
    });
    var newArr = [];
    for (var i=0; i<array.length; i++){
        if (array[i].name){
            newArr.push(array[i])
        } else {
            console.log(array[i].id)
        }
    }
    return newArr;
}

var SORTED_TIMEZONE_LIST = sortByTz(TIMEZONE_LIST.slice(0));

module.exports = function(lat, lon) {
  var x, u, y, v, t, i;

  /* Make sure lat/lon are valid numbers. (It is unusual to check for the
   * negation of whether the values are in range, but this form works for NaNs,
   * too!) */
  lat = +lat;
  lon = +lon;
  if(!(lat >= -90.0 && lat <= +90.0 && lon >= -180.0 && lon <= +180.0))
    throw new RangeError("invalid coordinates");

  /* The root node of the tree is wider than a normal node, acting essentially
   * as a "flattened" few layers of the tree. This saves a bit of overhead,
   * since the topmost nodes will probably all be full. */
  u = (x = (180.0 + lon) * COARSE_WIDTH  / 360.00000000000006)|0;
  v = (y = ( 90.0 - lat) * COARSE_HEIGHT / 180.00000000000003)|0;
  t = -1;
  i = DATA.readUInt16BE((v * COARSE_WIDTH + u) << 1);

  /* Recurse until we hit a leaf node. */
  while(i < MAX_TILES) {
    u = (x = ((x - u) % 1.0) * FINE_WIDTH )|0;
    v = (y = ((y - v) % 1.0) * FINE_HEIGHT)|0;
    t = t + i + 1;
    i = DATA.readUInt16BE((COARSE_WIDTH * COARSE_HEIGHT + (t * FINE_HEIGHT + v) * FINE_WIDTH + u) << 1);
  }

  /* Once we hit a leaf, return the relevant timezone. */
  return TIMEZONE_LIST[i - MAX_TILES];
};

module.exports.list = function(){
    return SORTED_TIMEZONE_LIST;
};