var cacheHelpers = require("cache-helpers"),
    fs           = require("fs"),
    path         = require("path"),
    util         = require("util"),
    cacheZones   = cacheHelpers.once(function(callback) {
      return fs.readFile(path.join(__dirname, "tz.json"), function(err, data) {
        if(err)
          return callback(err)

        var zones = JSON.parse(data),
            i     = zones.length,
            polygons, j, bounds

        while(i) {
          polygons = zones[--i]
          j        = polygons.length
          while(j--)
            polygons[j] = new Buffer(polygons[j], "base64")

          bounds = zones[--i]
          zones[i] = new Buffer(bounds, "base64")

          --i
        }

        return callback(null, zones)
      })
    })

function pointInZone(lat, lon, bounds, polygons) {
  lat = Math.round((lat + 90) * 65535 / 180)
  lon = Math.round((lon + 180) * 65535 / 360)

  /* Each timezone has a bounding box, in order to help speed up queries. */
  if(lat < bounds.readUInt16BE(0) ||
     lon < bounds.readUInt16BE(2) ||
     lat > bounds.readUInt16BE(4) ||
     lon > bounds.readUInt16BE(6))
    return false

  var i = polygons.length,
      polygon, inside, lati, loni, j, latj, lonj

  while(i--) {
    polygon = polygons[i]
    inside  = false
    lati    = polygon.readUInt16BE(0)
    loni    = polygon.readUInt16BE(2)
    j       = polygon.length

    while(j) {
      lonj = loni
      loni = polygon.readUInt16BE(j -= 2)
      latj = lati
      lati = polygon.readUInt16BE(j -= 2)

      if(((loni <= lon && lon < lonj) || (lonj <= lon && lon < loni)) &&
         (lat - lati < (latj - lati) * (lon - loni) / (lonj - loni)))
        inside = !inside
    }

    if(inside)
      return true
  }

  return false
}

module.exports = function(lat, lon, callback) {
  return cacheZones(function(err, zones) {
    if(err)
      return callback(err)

    var i = zones.length,
        polygons, bounds, tzid, now

    /* Every timezone has a list of polygons associated with it. If the
     * requested location is inside any of those polygons, then we're in that
     * timezone and should return it. */
    while(i) {
      polygons = zones[--i]
      bounds   = zones[--i]
      tzid     = zones[--i]

      if(pointInZone(lat, lon, bounds, polygons))
        return callback(null, tzid);
    }

    /* If we can't find the place we were looking for, assume (fairly
     * poorly) that we're in international waters and use the relevant IANA code
     * for it.
     * 
     * If the codes seem backwards, it's because they are backwards by design.
     * See also: ftp://ftp.iana.org/tz/data/etcetera */
    switch(Math.round((lon + 180) / 15)) {
      case  0: return callback(null, "Etc/GMT+12")
      case  1: return callback(null, "Etc/GMT+11")
      case  2: return callback(null, "Etc/GMT+10")
      case  3: return callback(null,  "Etc/GMT+9")
      case  4: return callback(null,  "Etc/GMT+8")
      case  5: return callback(null,  "Etc/GMT+7")
      case  6: return callback(null,  "Etc/GMT+6")
      case  7: return callback(null,  "Etc/GMT+5")
      case  8: return callback(null,  "Etc/GMT+4")
      case  9: return callback(null,  "Etc/GMT+3")
      case 10: return callback(null,  "Etc/GMT+2")
      case 11: return callback(null,  "Etc/GMT+1")
      case 12: return callback(null,    "Etc/GMT")
      case 13: return callback(null,  "Etc/GMT-1")
      case 14: return callback(null,  "Etc/GMT-2")
      case 15: return callback(null,  "Etc/GMT-3")
      case 16: return callback(null,  "Etc/GMT-4")
      case 17: return callback(null,  "Etc/GMT-5")
      case 18: return callback(null,  "Etc/GMT-6")
      case 19: return callback(null,  "Etc/GMT-7")
      case 20: return callback(null,  "Etc/GMT-8")
      case 21: return callback(null,  "Etc/GMT-9")
      case 22: return callback(null, "Etc/GMT-10")
      case 23: return callback(null, "Etc/GMT-11")
      case 24: return callback(null, "Etc/GMT-12")
    }
  })
}
